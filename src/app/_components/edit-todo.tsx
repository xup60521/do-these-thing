"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type todos as TodoTable,
  type groups as GroupTable,
} from "@/server/db/schema";
import { api } from "@/trpc/react";
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type InferSelectModel } from "drizzle-orm";
import { Fragment, useState } from "react";
import ReactSelect from "react-select";
import { toast } from "sonner";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function EditTodo({
  children,
  todo,
  groups,
}: {
  children: React.ReactNode;
  todo: InferSelectModel<typeof TodoTable>;
  groups: InferSelectModel<typeof GroupTable>[];
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [inputTitle, setInputTitle] = useState(todo.todoTitle);
  const [inputDescription, setInputDescription] = useState(
    todo.todoDescription ?? "",
  );
  const [selectedGroup, setSelectedGroup] = useState<string | null>(
    todo.groupId,
  );
  const [openAlertDialog, setOpenAlertDialog] = useState(false)
  const todoMutation = api.todo.editTodo.useMutation();
  const deleteTodoMutation = api.todo.deleteTodo.useMutation()
  const router = useRouter()
  const selectOptions = [
    { label: "default", value: null },
    ...groups.map((d) => ({ label: d.groupTitle, value: d.groupId })),
  ];
  function handleCloseDialog(e: boolean) {
    setOpenDialog(e);
    setInputTitle(todo.todoTitle);
    setInputDescription(todo.todoDescription ?? "");
  }
  function handleSave() {
    if (!inputTitle) {
        toast("Title is required")
        return;
    }
    todoMutation.mutateAsync({
        todoId: todo.todoId,
        todoTitle: inputTitle,
        todoDescription: inputDescription,
        todoGroup: selectedGroup
    }).then(()=>{
        handleCloseDialog(false)
    }).catch(err => alert(err))
  }
  function handleDeleteTodo() {
    deleteTodoMutation.mutateAsync({
        todoId: todo.todoId
    }).then(()=>{
        setOpenAlertDialog(false)
        router.refresh()
    }).catch(err => alert(err))
  }

  return (
    <Fragment>
      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={`${todoMutation.isPending && "cursor-wait"}`}>
          <DialogHeader>
            <DialogTitle>Edit To-do</DialogTitle>
            <DialogDescription>
              Enter title, descriptioin and group.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-name">title</Label>
              <Input
                id="input-name"
                className="col-span-3"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-description">description</Label>
              <Input
                id="input-description"
                className="col-span-3"
                value={inputDescription}
                onChange={(e) => setInputDescription(e.target.value)}
                maxLength={255}
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-group">group</Label>
              <ReactSelect
                id="input-group"
                options={selectOptions}
                className="col-span-3"
                defaultValue={selectOptions.find(item => item.value === selectedGroup) ?? {label: "default", value: null}}
                onChange={e => setSelectedGroup(e?.value ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={()=>{
                setOpenDialog(false)
                setOpenAlertDialog(true)
            }}>Delete</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
            <AlertDialogContent className={`${deleteTodoMutation.isPending && "cursor-wait"}`}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete a to-do</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={handleDeleteTodo} className={`${deleteTodoMutation.isPending && "cursor-wait"}`}>Sure</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}
