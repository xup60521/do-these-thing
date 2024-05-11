import CreateTodo from "@/app/_components/create-todo";
import DisplayTodo from "@/app/_components/display-todo";
import { Label } from "@/components/ui/label";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Fragment } from "react";

export default async function TaskLibrary() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  const groups = await db.query.groups.findMany({
    where: (fields, { eq }) => eq(fields.groupOwner, session.user.id),
    with: {
      todos: true,
    },
  });
  const defaultTodos = await db.query.todos.findMany({
    where: (fields, { eq, and, isNull }) =>
      and(eq(fields.todoOwner, session.user.id), isNull(fields.groupId)),
  });
  return (
    <div className="relative flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="w-full pb-12 pt-16 text-left font-mono text-2xl font-bold">
        <span>Task Library</span>
        <span className="flex items-center gap-2 py-2 text-xs text-neutral-500">
          <Label
            htmlFor="new group button"
            className="cursor-pointer font-bold"
          >
            New To-Do
          </Label>
          <CreateTodo groups={groups}>
            <button
              id="new group button"
              className="size-6 rounded-full bg-white text-sm text-neutral-500 ring-green-200 transition hover:ring-2"
            >
              +
            </button>
          </CreateTodo>
        </span>
      </h1>
      <div className="flex min-h-0 w-full min-w-0 flex-col">
        <div className="flex w-full flex-wrap">
          <div className="flex w-full flex-grow flex-wrap gap-2 py-4">
            <div className="flex w-full flex-wrap items-center gap-3">
              <Link
                href="/do-these-things/group/default"
                className="-translate-y-1 rounded bg-neutral-700 p-2 font-mono text-sm text-white transition hover:bg-neutral-800"
              >
                Default
              </Link>
              {defaultTodos.map((item) => (
                <DisplayTodo item={item} key={item.todoId} />
              ))}
            </div>
            {groups.map((group) => {
              if (group.todos.length === 0) {
                return null;
              }
              return (
                <Fragment key={group.groupId}>
                  <div className="flex w-full mb-2 items-center gap-2 border-b-[1px] border-neutral-400 font-bold text-neutral-500"></div>
                  <div className="flex w-full flex-wrap items-center gap-3">
                    <Link
                      href={`/do-these-things/group/${group.groupId}`}
                      className="-translate-y-1 rounded bg-neutral-700 p-2 font-mono text-sm text-white transition hover:bg-neutral-800"
                    >
                      {group.groupTitle}
                    </Link>
                    {group.groupInvisible && (
                      <div className="-translate-y-[0.15rem] rounded-full p-1 px-2 font-mono text-xs bg-red-400 text-white">
                        {"hidden"}
                      </div>
                    )}
                    {group.todos.map((item) => (
                      <DisplayTodo item={item} key={item.todoId} />
                    ))}
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
