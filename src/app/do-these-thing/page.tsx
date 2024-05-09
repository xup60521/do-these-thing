import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import CreateTodo from "../_components/create-todo";
import { db } from "@/server/db";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type InferSelectModel } from "drizzle-orm";
import {type todos } from "@/server/db/schema";
import { Fragment } from "react";
import { api } from "@/trpc/server";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  const todos = await db.query.todos.findMany({
    where: (fields, { eq }) => eq(fields.todoOwner, session.user.id),
  });
  const groups = await db.query.groups.findMany();

  return (
    <div className="flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="w-full py-16 text-left font-mono text-2xl font-bold">
        Overview
      </h1>
      <div className="flex min-h-0 w-full min-w-0 flex-col">
        <div className="flex min-h-48 w-full flex-col items-center">
          <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
            <h3>To-Do</h3>
            <CreateTodo groups={groups}>
              <button className="size-6 rounded-full bg-white text-sm text-neutral-500 ring-green-200 transition hover:ring-2">
                +
              </button>
            </CreateTodo>
          </div>
          <div className="flex w-full flex-grow flex-col flex-wrap gap-2 py-4">
            {!todos.length && <p>No to-do yet</p>}
            <div className="flex h-48 w-36 flex-col gap-3 rounded-2xl bg-white p-4">
              <h4 className="w-full pb-2 text-center text-sm text-neutral-700 font-mono">
                default
              </h4>
              {todos
                .filter((d) => !d.groupId)
                .sort((a, b) => {
                  return (a.todoChecked ? 1 : 0) - (b.todoChecked ? 1 : 0);
                })
                .map((item) => (
                  <Fragment key={item.todoId}>
                    <DisplayTodo item={item} />
                  </Fragment>
                ))}
            </div>
            {groups.map((item) => (
              <div
                className="flex h-48 w-36 flex-col gap-3 rounded-2xl bg-white p-4"
                key={item.groupId}
              >
                <h4 className="w-full pb-2 text-center text-sm text-neutral-700 font-mono">
                  {item.groupTitle}
                </h4>
                {todos
                  .filter((d) => d.groupId === item.groupId)
                  .sort((a, b) => {
                    return (a.todoChecked ? 1 : 0) - (b.todoChecked ? 1 : 0);
                  })
                  .map((item) => (
                    <Fragment key={item.todoId}>
                      <DisplayTodo item={item} />
                    </Fragment>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DisplayTodo({ item }: { item: InferSelectModel<typeof todos> }) {
  async function checkToDo() {
    "use server";
    await api.todo.checkTodo({todoId: item.todoId, checked: !item.todoChecked})
  }
  const checkboxId = `to-do checkbox ${item.todoId}`;
  return (
    <form action={checkToDo}>
      <div key={item.todoId} className="flex w-full gap-2">
        <Checkbox checked={item.todoChecked} id={checkboxId} type="submit" />
        <Label htmlFor={checkboxId} className="cursor-pointer">{item.todoTitle}</Label>
      </div>
    </form>
  );
}
