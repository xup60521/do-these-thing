"use client";

import { type InferSelectModel } from "drizzle-orm";
import { type groups as GroupTable } from "@/server/db/schema";
import { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CreateRule({
  children,
  groups,
}: {
  children: React.ReactNode;
  groups: InferSelectModel<typeof GroupTable>[];
}) {
  const [open, setOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  function onDialogOpenChange(e: boolean) {
    setOpen(e);
    setInputName("");
  }
  function handleAdd() {
    if (!inputName) {
        toast("Name is required")
        return;
    }
  }

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={onDialogOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New rule</DialogTitle>
            <DialogDescription>
              Create a rule that automatically add to-do, toggle group
              invisibility and more.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-name">name</Label>
              <Input
                id="input-name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="col-span-3"
                maxLength={255}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
