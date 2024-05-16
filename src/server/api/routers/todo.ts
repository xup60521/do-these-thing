import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  RuleDetailJsonSchema,
  type RuleDetailJson_ConditionalAddSchema,
  type RuleDetailJson_PlannedToggleGroupSchema,
  groups,
  ruleTypeEnum,
  rules,
  todos,
} from "@/server/db/schema";
import { v4 } from "uuid";
import { revalidatePath } from "next/cache";
import { and, eq, gte, inArray, or, sql } from "drizzle-orm";

export const todoRouter = createTRPCRouter({
  createTodo: protectedProcedure
    .input(
      z.object({
        todoTitle: z.string().max(255),
        todoDescription: z.string().max(255).nullable(),
        groupId: z.string().max(255).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const uuid = v4();
      await ctx.db.insert(todos).values({
        todoId: uuid,
        todoTitle: input.todoTitle,
        todoDescription: input.todoDescription,
        groupId: input.groupId,
        todoChecked: false,
        todoOwner: ctx.session.user.id,
      });
      revalidatePath("/do-these-things");
    }),
  checkTodo: protectedProcedure
    .input(
      z.object({
        todoId: z.string(),
        checked: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(todos)
        .set({ todoChecked: input.checked })
        .where(eq(todos.todoId, input.todoId));
      if (input.checked) {
        await ctx.db
          .update(rules)
          .set({
            ruleCurrentNumber: sql`${rules.ruleCurrentNumber} + 1`,
          })
          .where(
            and(
              or(
                eq(rules.ruleType, "conditional-add"),
                eq(rules.ruleType, "planned-toggle-group"),
              ),
              eq(rules.ruleOwner, ctx.session.user.id),
              eq(rules.ruleEnable, true),
            ),
          );
      } else {
        await ctx.db
          .update(rules)
          .set({
            ruleCurrentNumber: sql`${rules.ruleCurrentNumber} - 1`,
          })
          .where(
            and(
              or(
                eq(rules.ruleType, "conditional-add"),
                eq(rules.ruleType, "planned-toggle-group"),
              ),
              eq(rules.ruleOwner, ctx.session.user.id),
              eq(rules.ruleEnable, true),
            ),
          );
      }
      if (!input.checked) {
        return;
      }
      const todoUpdate = (await ctx.db
        .update(rules)
        .set({ ruleCurrentNumber: 0 })
        .where(
          and(
            gte(rules.ruleCurrentNumber, rules.ruleGateNumber),
            eq(rules.ruleType, "conditional-add"),
          ),
        )
        .returning({
          ruleId: rules.ruleId,
          ruleDetail: rules.ruleDetailJson,
        })) as {
        ruleId: string;
        ruleDetail: z.infer<typeof RuleDetailJson_ConditionalAddSchema>;
      }[];
      const new_todos = todoUpdate
        .map((item) => {
          if ("targetNumber" in item.ruleDetail) {
            return Array.from(new Array(item.ruleDetail.targetNumber)).map(
              () => {
                const uuid = v4();
                return {
                  todoId: uuid,
                  todoTitle: item.ruleDetail.targetTodoName,
                  groupId: item.ruleDetail.toGroup ?? "",
                  todoChecked: false,
                  todoOwner: ctx.session.user.id,
                  baseRule: item.ruleId,
                };
              },
            );
          }
          return [];
        })
        .flat();
      if (new_todos.length > 0) {
        await ctx.db.insert(todos).values(new_todos);
      }
      const groupUpdate = (await ctx.db
        .update(rules)
        .set({ ruleCurrentNumber: 0 })
        .where(
          and(
            gte(rules.ruleCurrentNumber, rules.ruleGateNumber),
            eq(rules.ruleType, "planned-toggle-group"),
          ),
        )
        .returning({
          ruleId: rules.ruleId,
          ruleDetail: rules.ruleDetailJson,
        })) as {
        ruleId: string;
        ruleDetail: z.infer<typeof RuleDetailJson_PlannedToggleGroupSchema>;
      }[];
      const groupTurnInvisible = groupUpdate
        .filter((d) => d.ruleDetail.targetInvisibility)
        .map((d) => d.ruleDetail.toGroup);
      const groupTurnNotInvisible = groupUpdate
        .filter((d) => !d.ruleDetail.targetInvisibility)
        .map((d) => d.ruleDetail.toGroup);
      if (groupTurnInvisible.length > 0) {
        await ctx.db
          .update(groups)
          .set({ groupInvisible: true })
          .where(inArray(groups.groupId, groupTurnInvisible));
      }
      if (groupTurnNotInvisible.length > 0) {
        await ctx.db
          .update(groups)
          .set({ groupInvisible: false })
          .where(inArray(groups.groupId, groupTurnNotInvisible));
      }
      revalidatePath("/do-these-things");
      revalidatePath("/do-these-things/task-library");
      revalidatePath("/do-these-things/group");
    }),

  editTodo: protectedProcedure
    .input(
      z.object({
        todoId: z.string(),
        todoTitle: z.string(),
        todoDescription: z.string().nullable(),
        todoGroup: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(todos)
        .set({
          todoTitle: input.todoTitle,
          todoDescription: input.todoDescription,
          groupId: input.todoGroup,
        })
        .where(eq(todos.todoId, input.todoId));

      revalidatePath("/do-these-things");
      revalidatePath("/do-these-things/task-library");
      revalidatePath("/do-these-things/group");
    }),
  deleteTodo: protectedProcedure
    .input(
      z.object({
        todoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(todos).where(eq(todos.todoId, input.todoId));
      revalidatePath("/do-these-things");
      revalidatePath("/do-these-things/task-library");
      revalidatePath("/do-these-things/group");
    }),
  createGroup: protectedProcedure
    .input(
      z.object({
        groupTitle: z.string(),
        groupDescription: z.string(),
        groupInvisible: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const uuid = v4();
      await ctx.db.insert(groups).values({
        ...input,
        groupId: uuid,
        groupOwner: ctx.session.user.id,
      });
      revalidatePath("/do-these-things");
      revalidatePath("/do-these-things/task-library");
      revalidatePath("/do-these-things/group");
    }),
  editGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        groupTitle: z.string(),
        groupDescription: z.string().nullable(),
        groupInvisible: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { groupTitle, groupDescription, groupId, groupInvisible } = input;
      await ctx.db
        .update(groups)
        .set({ groupTitle, groupDescription, groupInvisible })
        .where(eq(groups.groupId, groupId));
      revalidatePath("/do-these-things");
      revalidatePath("/do-these-things/task-library");
      revalidatePath("/do-these-things/group");
    }),
  deleteGroup: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        deleteRelatives: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { groupId, deleteRelatives } = input;
      if (deleteRelatives) {
        await ctx.db.delete(todos).where(eq(todos.groupId, groupId));
      } else {
        await ctx.db
          .update(todos)
          .set({ groupId: null })
          .where(eq(todos.groupId, groupId));
      }
      await ctx.db.delete(groups).where(eq(groups.groupId, groupId));
    }),
  createRule: protectedProcedure
    .input(
      z.object({
        ruleTitle: z.string(),
        ruleDescription: z.string(),
        ruleType: z.enum(ruleTypeEnum),
        ruleDetailJson: RuleDetailJsonSchema,
        ruleGateNumber: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        ruleTitle,
        ruleDescription,
        ruleType,
        ruleGateNumber,
        ruleDetailJson,
      } = input;
      const ruleId = v4();
      await ctx.db.insert(rules).values({
        ruleId,
        ruleOwner: ctx.session.user.id,
        ruleTitle,
        ruleDescription,
        ruleType,
        ruleDetailJson,
        ruleEnable: true,
        ruleGateNumber,
      });
      revalidatePath("/do-these-things/rule");
    }),
  updateRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.string(),
        ruleTitle: z.string(),
        ruleDescription: z.string(),
        ruleDetailJson: RuleDetailJsonSchema,
        ruleGateNumber: z.number(),
        ruleEnable: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(rules)
        .set({ ...input })
        .where(eq(rules.ruleId, input.ruleId));
      revalidatePath("/do-these-things/rule");
    }),
  deleteRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(todos)
        .set({ baseRule: null })
        .where(eq(todos.baseRule, input.ruleId));
      await ctx.db.delete(rules).where(eq(rules.ruleId, input.ruleId));
      revalidatePath("/do-these-things/rule");
    }),
});
