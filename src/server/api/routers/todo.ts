import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { groups, todos } from "@/server/db/schema";
import { v4 } from "uuid";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

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
      revalidatePath("/do-these-things");
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
      revalidatePath("/do-these-things/group");
    }),
});
