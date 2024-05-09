"use client";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { toast } from "sonner";

export default function CreateTodo({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  function handleAdd() {
    if (!inputName && !inputDescription) {
        toast("No input name and description")
        return;
    }
    onClose(false)
  }
  function onClose(e: boolean) {
    setOpen(e)
    setInputName("")
    setInputDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New To-do</DialogTitle>
          <DialogDescription>
            Enter title, description to create a to-do.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 items-center">
            <Label htmlFor="input-name">name</Label>
            <Input id="input-name" className="col-span-3" value={inputName} onChange={e => setInputName(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center">
            <Label htmlFor="input-description">description</Label>
            <Input id="input-description" className="col-span-3" value={inputDescription} onChange={e => setInputDescription(e.target.value)} />
          </div>
          {/* <div className="grid grid-cols-4 items-center">
            <Label htmlFor="input-group">group</Label>
            <Input id="input-group" className="col-span-3" />
          </div> */}
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
