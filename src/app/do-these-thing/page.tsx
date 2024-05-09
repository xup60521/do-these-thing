import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import CreateTodo from "../_components/create-todo";

export default async function Page() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  return (
    <div className="flex w-[70rem] max-w-full flex-col">
      <h1 className="w-full py-16 text-left font-mono text-2xl font-bold">
        Overview
      </h1>
      <div className="flex min-h-0 w-full min-w-0 flex-col">
        <div className="flex min-h-48 w-full flex-col items-center">
          <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
            <h3>To-Do</h3>
            <CreateTodo>
              <button className="size-6 rounded-full bg-white text-sm text-neutral-500 ring-green-200 transition hover:ring-2">
                +
              </button>
            </CreateTodo>
          </div>
          <div className="flex-grow"></div>
        </div>
      </div>
    </div>
  );
}
