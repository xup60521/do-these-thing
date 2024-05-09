"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { todos as TodosType } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
export default function DisplayTodo({
  item,
}: {
  item: InferSelectModel<typeof TodosType>;
}) {
  const checkboxId = `to-do checkbox ${item.todoId}`;
  return (
    <div className="flex w-full gap-2">
      <Checkbox checked={item.todoChecked} id={checkboxId} />
      <Label htmlFor={checkboxId}>{item.todoTitle}</Label>
    </div>
  );
}
