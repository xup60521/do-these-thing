"use client";
import { Checkbox } from "@/components/ui/checkbox";
import type { todos as TodosType } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { type InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function DisplayTodo({
  item,
}: {
  item: InferSelectModel<typeof TodosType>;
}) {
  const [checked, setChecked] = useState(item.todoChecked);
  const router = useRouter();
  const mutation = api.todo.checkTodo.useMutation();
  function checkTodo() {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate({ todoId: item.todoId, checked: !checked });
    setChecked(!checked);
  }

  return (
    <div className="box-border flex w-fit max-w-full gap-2" id="display todo">
      <Checkbox
        checked={checked}
        onCheckedChange={checkTodo}
        className={`${mutation.isPending && "cursor-wait"}`}
      />
      <Link
        href={`/do-these-things/task-library/${item.todoId}`}
        className={`${mutation.isPending ? "cursor-wait" : "cursor-pointer"} min-w-0 flex-shrink -translate-y-[0.15rem] text-wrap break-all text-sm`}
      >
        {item.todoTitle}
      </Link>
    </div>
  );
}
