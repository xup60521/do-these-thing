import CreateGroup from "@/app/_components/create-group";
import { Label } from "@/components/ui/label";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { type Session } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MdCheckBox } from "react-icons/md";
import { MdCheckBoxOutlineBlank } from "react-icons/md";

export default async function Group() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="w-full py-16 text-left font-mono text-2xl font-bold">
        <span>Group</span>
      </h1>
      <DisplayGroups session={session} />
    </div>
  );
}

async function DisplayGroups({ session }: { session: Session }) {
  const groups = await db.query.groups.findMany({
    where: (fields, { eq }) => eq(fields.groupOwner, session.user.id),
    with: {
      todos: {
        columns: {
          todoChecked: true,
        },
      },
    },
  });
  const defaultGroup = await db.query.todos.findMany({
    where: (fields, { eq, and, isNull }) =>
      and(isNull(fields.groupId), eq(fields.todoOwner, session.user.id)),
    columns: {
      todoChecked: true,
    },
  });
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-col">
      <div className="flex w-full flex-wrap">
        <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
          <Label
            htmlFor="new group button"
            className="cursor-pointer font-bold"
          >
            New Group
          </Label>
          <CreateGroup>
            <button
              id="new group button"
              className="size-6 rounded-full bg-white text-sm text-neutral-500 ring-green-200 transition hover:ring-2"
            >
              +
            </button>
          </CreateGroup>
        </div>
        <div className="flex w-full flex-grow flex-wrap gap-2 py-4">
          <Link
            href={"group/default"}
            className="flex items-center rounded-md bg-white"
          >
            <h4 className="w-full p-2 font-mono text-sm text-neutral-700">
              default
            </h4>
            <div className="flex items-center h-full justify-center gap-1 rounded-l bg-orange-200 px-2 py-2 text-red-700">
              <span className="text-center">
                <MdCheckBoxOutlineBlank />
              </span>
              <span className="text-center font-mono text-sm">{`${defaultGroup.filter((d) => !d.todoChecked).length}`}</span>
            </div>
            <div className="flex items-center h-full justify-center gap-1 rounded-r-md bg-green-200 px-2 py-2 text-neutral-700">
              <span className="text-center">
                <MdCheckBox />
              </span>
              <span className="text-center font-mono text-sm">{`${defaultGroup.filter((d) => d.todoChecked).length}`}</span>
            </div>
          </Link>
          {groups
            .filter((d) => !d.groupInvisible)
            .map((item) => (
              <Link
                href={`group/${item.groupId}`}
                className="flex items-center rounded-md bg-white"
                key={`group itr ${item.groupId}`}
              >
                <h4 className="w-full p-2 font-mono text-sm text-neutral-700">
                  {item.groupTitle}
                </h4>
                <div className="flex items-center h-full justify-center gap-1 rounded-l bg-orange-200 px-2 py-2 text-red-700">
                  <span className="text-center">
                    <MdCheckBoxOutlineBlank />
                  </span>
                  <span className="text-center font-mono text-sm">{`${item.todos.filter((d) => !d.todoChecked).length}`}</span>
                </div>
                <div className="flex items-center h-full justify-center gap-1 rounded-r-md bg-green-200 px-2 py-2 text-neutral-700">
                  <span className="text-center">
                    <MdCheckBox />
                  </span>
                  <span className="text-center font-mono text-sm">{`${item.todos.filter((d) => d.todoChecked).length}`}</span>
                </div>
              </Link>
            ))}
        </div>
        <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
          <span>hidden</span>
        </div>
        <div className="flex w-full flex-grow flex-wrap gap-2 py-4">
          {groups
            .filter((d) => d.groupInvisible)
            .map((item) => (
              <Link
                href={`group/${item.groupId}`}
                className="flex items-center rounded-md bg-white"
                key={`group itr ${item.groupId}`}
              >
                <h4 className="w-full p-2 font-mono text-sm text-neutral-700">
                  {item.groupTitle}
                </h4>
                <div className="flex items-center h-full justify-center gap-1 rounded-l bg-orange-200 px-2 py-2 text-red-700">
                  <span className="text-center">
                    <MdCheckBoxOutlineBlank />
                  </span>
                  <span className="text-center font-mono text-sm">{`${item.todos.filter((d) => !d.todoChecked).length}`}</span>
                </div>
                <div className="flex items-center h-full justify-center gap-1 rounded-r-md bg-green-200 px-2 py-2 text-neutral-700">
                  <span className="text-center">
                    <MdCheckBox />
                  </span>
                  <span className="text-center font-mono text-sm">{`${item.todos.filter((d) => d.todoChecked).length}`}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
