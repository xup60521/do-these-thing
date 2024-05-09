import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { todos } from "@/server/db/schema";
import { v4 } from "uuid";

export const todoRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        todoTitle: z.string().max(255),
        todoDescription: z.string().max(255).nullable(),
        groupId: z.string().max(255).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(todos).values({
        todoId: v4(),
        todoTitle: input.todoTitle,
        todoDescription: input.todoDescription,
        groupId: input.groupId,
        todoChecked: false,
        todoOwner: ctx.session.user.id,
      });
    }),
});
