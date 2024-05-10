import DisplayTodo from "@/app/_components/display-todo";
import EditGroup from "@/app/_components/edit-group";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import { MdEdit } from "react-icons/md";

export default async function GroupId({
  params,
}: {
  params: { groupid: string };
}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  const { groupid } = params;
  const group =
    groupid === "default"
      ? { groupTitle: "default", groupDescription: "" }
      : await db.query.groups.findFirst({
          where: (fields, { and, eq }) =>
            and(
              eq(fields.groupOwner, session.user.id),
              eq(fields.groupId, groupid),
            ),
        });
  if (!group) {
    redirect("/do-these-things/group");
  }

  const todos = await db.query.todos.findMany({
    where: (fields, { eq, and, isNull }) =>
      and(
        eq(fields.todoOwner, session.user.id),
        groupid === "default"
          ? isNull(fields.groupId)
          : eq(fields.groupId, groupid),
      ),
  });
  return (
    <div className="flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="w-full py-12 pt-16 text-left font-mono text-2xl font-bold">
        <p className="flex items-center gap-3">
          <span>{group?.groupTitle}</span>
          {groupid !== "default" && (
            <EditGroup group={group}>
              <button className="translate-y-[0.05rem] rounded-full bg-white p-2 text-sm ring-green-200 transition hover:ring-2">
                <MdEdit />
              </button>
            </EditGroup>
          )}
        </p>
        <span className="flex items-center gap-2 pt-3 text-sm text-neutral-500">
          {group?.groupDescription}
        </span>
      </h1>
      <div className="flex min-h-0 w-full min-w-0 flex-col">
        <div className="flex w-full flex-wrap">
          <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
            to-do
          </div>
          <div className="flex w-full flex-grow flex-wrap gap-3 py-4">
            {todos
              .filter((d) => !d.todoChecked)
              .map((item) => (
                <div
                  className="flex items-center rounded-full bg-white px-4 py-2 pb-1"
                  key={item.todoId}
                >
                  <DisplayTodo item={item} />
                </div>
              ))}
          </div>
          <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
            <span>completed</span>
          </div>
          <div className="flex w-full flex-grow flex-wrap gap-3 py-4">
            {todos
              .filter((d) => d.todoChecked)
              .map((item) => (
                <div
                  className="flex items-center rounded-full bg-white px-4 py-2 pb-1"
                  key={item.todoId}
                >
                  <DisplayTodo item={item} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
