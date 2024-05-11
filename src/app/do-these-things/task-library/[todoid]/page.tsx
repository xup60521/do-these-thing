import EditTodo from "@/app/_components/edit-todo";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MdEdit } from "react-icons/md";

export default async function Page({ params }: { params: { todoid: string } }) {
  const todoId = params.todoid;
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  const todo = await db.query.todos.findFirst({
    where: (f, { and, eq }) =>
      and(eq(f.todoOwner, session.user.id), eq(f.todoId, todoId)),
    with: {
      groups: true,
    },
  });
  if (!todo) {
    redirect("/do-these-things/task-library");
  }
  const groups = await db.query.groups.findMany({
    where: ((f, {eq}) => eq(f.groupOwner, session.user.id))
  })
  async function handleCheckTodo() {
    "use server";
    if (!todo) {
      return;
    }
    await api.todo.checkTodo({
      todoId: todo.todoId,
      checked: !todo.todoChecked,
    });
    revalidatePath(".");
  }

  return (
    <div className="flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="flex w-full flex-col gap-2 py-12 pt-16 text-left font-mono text-2xl font-bold">
      <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <span>Checked: </span>
              <form action={handleCheckTodo}>
                <Checkbox
                  className="translate-y-[0.175rem]"
                  checked={todo.todoChecked}
                  type="submit"
                />
              </form>
            </div>
        <div className="flex items-center gap-3">
            
          <span>{todo.todoTitle}</span>
          <EditTodo todo={todo} groups={groups}>
            <button
              id="edit group"
              className="translate-y-[0.05rem] rounded-full bg-white p-2 text-sm ring-green-200 transition hover:ring-2"
            >
              <MdEdit />
            </button>
          </EditTodo>
        </div>
        <Link href={`/do-these-things/group/${todo.groupId ?? "default"}`} className="flex items-center gap-2 text-sm text-neutral-500">
          {todo.groups?.groupTitle ?? "default"}
        </Link>
      </h1>
      <div className="flex min-h-0 w-full min-w-0 flex-col">
        <div className="flex w-full flex-wrap">
          <div className="flex w-full items-center justify-between gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
            <span>Description</span>
            
          </div>
          <div className="flex w-full flex-grow flex-wrap gap-3 py-4">
            {todo.todoDescription}
          </div>
        </div>
      </div>
    </div>
  );
}