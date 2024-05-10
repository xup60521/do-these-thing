"use client";
import { Checkbox } from "@/components/ui/checkbox";
import type { todos as TodosType } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { type InferSelectModel } from "drizzle-orm";
import { useState } from "react";
export default function DisplayTodo({
  item,
}: {
  item: InferSelectModel<typeof TodosType>;
}) {

  const [checked, setChecked] = useState(item.todoChecked)
  const mutation = api.todo.checkTodo.useMutation()
  function checkTodo() {
    if (mutation.isPending) {
        return;
    }
    mutation.mutate({todoId: item.todoId, checked: !checked})
    setChecked(!checked)
  }

  return (
    <div className="flex w-full gap-2">
      <Checkbox checked={checked} onCheckedChange={checkTodo} className={`${mutation.isPending && "cursor-wait"}`} />
      <span className={`${mutation.isPending ? "cursor-wait" : "cursor-pointer"} text-sm -translate-y-[0.15rem]`}>{item.todoTitle}</span>
    </div>
  );
}