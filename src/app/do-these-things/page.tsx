import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import CreateTodo from "../_components/create-todo";
import { db } from "@/server/db";
import { Fragment } from "react";
import DisplayTodo from "../_components/display-todo";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { type Session } from "next-auth";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="w-full py-16 text-left font-mono text-2xl font-bold">
        Overview
      </h1>
      <DisplayOverview session={session} />
    </div>
  );
}

async function DisplayOverview({ session }: { session: Session }) {
  const defaultTodos = await db.query.todos.findMany({
    where: (fields, { eq }) => eq(fields.todoOwner, session.user.id),
  });
  const groups = await db.query.groups.findMany({
    where: (fields, { eq }) => eq(fields.groupOwner, session.user.id),
    with: {
      todos: true,
    },
  });
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-col">
      <div className="flex min-h-48 w-full flex-col items-center">
        <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
          <Label htmlFor="new todo button" className="cursor-pointer font-bold">
            To-Do
          </Label>
          <CreateTodo groups={groups}>
            <button
              id="new todo button"
              className="size-6 rounded-full bg-white text-sm text-neutral-500 ring-green-200 transition hover:ring-2"
            >
              +
            </button>
          </CreateTodo>
        </div>
        <div className="flex w-full flex-grow  flex-wrap gap-4 py-4">
          <div className="flex h-48 w-full flex-col gap-3 sm:w-40">
            <h4 className="w-full truncate pb-2 text-left font-mono text-sm text-neutral-700">
              <Link href={`/do-these-things/group/default`}>default</Link>
            </h4>
            <ScrollArea className="flex h-full">
              <div className="flex w-full min-w-0 max-w-full flex-shrink flex-col gap-3 pr-2 sm:w-40">
                {defaultTodos
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
            </ScrollArea>
          </div>
          {groups
            .filter((d) => !d.groupInvisible)
            .map((item) => {
              if (item.todos.length === 0) {
                return null;
              }
              return (
                <Fragment key={item.groupId}>
                  <div className="flex h-48 w-full flex-col gap-3 sm:w-40">
                    <h4 className="w-full truncate pb-2 text-left font-mono text-sm text-neutral-700">
                      <Link href={`/do-these-things/group/${item.groupId}`}>
                        {item.groupTitle}
                      </Link>
                    </h4>
                    <ScrollArea className="h-full w-40">
                      <div className="flex w-full flex-col gap-3 pr-2 sm:w-40">
                        {item.todos
                          .filter((d) => d.groupId === item.groupId)
                          .sort((a, b) => {
                            return (
                              (a.todoChecked ? 1 : 0) - (b.todoChecked ? 1 : 0)
                            );
                          })
                          .map((item) => (
                            <Fragment key={item.todoId}>
                              <DisplayTodo item={item} />
                            </Fragment>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </Fragment>
              );
            })}
        </div>
      </div>
    </div>
  );
}
