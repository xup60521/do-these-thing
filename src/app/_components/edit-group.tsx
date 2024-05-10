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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [inputHidden, setInputHidden] = useState(
    Boolean(group.groupInvisible ?? false),
  );
  const mutation = api.todo.editGroup.useMutation();
  const router = useRouter();
  function onClose(e: boolean) {
    setOpen(e);
    setInputName(group.groupTitle);
    setInputDescription(group.groupDescription ?? "");
    setInputHidden(Boolean(group.groupInvisible ?? false));
  }
  function handleSave() {
    if (!inputName) {
      toast("Group name is required");
      return;
    }
    if (!group.groupId) {
      return;
    }
    mutation.mutate({
      groupId: group.groupId,
      groupTitle: inputName,
      groupDescription: inputDescription,
      groupInvisible: inputHidden,
    });
    router.refresh();
    onClose(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Enter title, description to edit a group.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 items-center">
            <Label htmlFor="input-visible">hidden</Label>
            <Checkbox checked={inputHidden} onCheckedChange={() => setInputHidden(!inputHidden)} />
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
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
