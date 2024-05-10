"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputHidden, setInputHidden] = useState(false);
  const mutation = api.todo.createGroup.useMutation();
  const router = useRouter();
  async function handleAdd() {
    if (!inputName && !inputDescription) {
      toast("No input name and description");
      return;
    }
    mutation.mutateAsync({
      groupTitle: inputName,
      groupDescription: inputDescription,
      groupInvisible: inputHidden,
    }).then(()=>{
        router.refresh();
        onClose(false);

    }).catch(err => alert(err));
  }
  function onClose(e: boolean) {
    setOpen(e);
    setInputName("");
    setInputDescription("");
    setInputHidden(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={`${mutation.isPending && "cursor-wait"}`}>
        <DialogHeader>
          <DialogTitle>New Group</DialogTitle>
          <DialogDescription>
            Enter title, description to create a group.
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
            <Label htmlFor="input-name">name</Label>
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
          {/* <div className="grid grid-cols-4 items-center">
            <Label htmlFor="input-group">group</Label>
            <Input id="input-group" className="col-span-3" />
          </div> */}
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} className={`${mutation.isPending && "cursor-wait"}`}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
