"use client";

import { type groups as GroupTable } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EditGroup({
  group,
  children,
}: {
  group:
    | InferSelectModel<typeof GroupTable>
    | {
        groupId?: string;
        groupTitle: string;
        groupDescription: string;
        groupInvisible?: boolean;
      };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [inputName, setInputName] = useState(group.groupTitle);
  const [inputDescription, setInputDescription] = useState(
    group.groupDescription ?? "",
  );
  const [openAlert, setOpenAlert] = useState(false);
  const [deleteRelateTodos, setDeleteRelateTodos] = useState(false);
  const [inputHidden, setInputHidden] = useState(
    Boolean(group.groupInvisible ?? false),
  );
  const mutation = api.todo.editGroup.useMutation();
  const deleteGroupMutation = api.todo.deleteGroup.useMutation();
  const router = useRouter();

  function onClose(e: boolean) {
    setOpen(e);
    setInputName(group.groupTitle);
    setInputDescription(group.groupDescription ?? "");
    setInputHidden(Boolean(group.groupInvisible ?? false));
  }
  async function handleSave() {
    if (!inputName) {
      toast("Group name is required");
      return;
    }
    if (!group.groupId) {
      return;
    }
    mutation
      .mutateAsync({
        groupId: group.groupId,
        groupTitle: inputName,
        groupDescription: inputDescription,
        groupInvisible: inputHidden,
      })
      .then(() => {
        router.refresh();
        onClose(false);
      })
      .catch((err) => alert(err));
  }
  function onAlertClose(e: boolean) {
    setOpenAlert(e);
    setDeleteRelateTodos(false);
  }
  async function handleDeleteGroup() {
    if (!group.groupId) {
      return;
    }
    deleteGroupMutation
      .mutateAsync({
        groupId: group.groupId,
        deleteRelatives: deleteRelateTodos,
      })
      .then(() => {
        router.refresh();
        setOpenAlert(false);
      })
      .catch((err) => alert(err));
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={`${mutation.isPending && "cursor-wait"}`}>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Enter title, description to edit a group.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-visible">hidden</Label>
              <Checkbox
                checked={inputHidden}
                onCheckedChange={() => setInputHidden(!inputHidden)}
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-name">title</Label>
              <Input
                id="input-name"
                className="col-span-3"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
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
          </div>
          <DialogFooter className="gap-1">
            <Button
              variant={"destructive"}
              onClick={() => {
                setOpen(false);
                setOpenAlert(true);
              }}
            >
              Delete
            </Button>
            <Button
              onClick={handleSave}
              className={`${mutation.isPending && "cursor-wait"}`}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={openAlert} onOpenChange={onAlertClose}>
        <AlertDialogContent
          className={`${deleteGroupMutation.isPending && "cursor-wait"}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete a group</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3">
                <p>
                  You can also delete all the relative to-dos, otherwise they
                  will move to default group.
                </p>
                <p className="flex items-center gap-2">
                  <Checkbox
                    id="check delete all relative to-dos"
                    checked={deleteRelateTodos}
                    onCheckedChange={() =>
                      setDeleteRelateTodos(!deleteRelateTodos)
                    }
                  />
                  <Label htmlFor="check delete all relative to-dos">
                    delete all relative to-dos?
                  </Label>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteGroup}
              className={`${deleteGroupMutation.isPending && "cursor-wait"}`}
            >
              Sure!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
