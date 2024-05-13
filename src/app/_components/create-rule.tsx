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
import { ruleTypeEnum } from "@/server/db/schema";
import ReactSelect from "react-select";
import { api } from "@/trpc/react";

const ruleTypeOptions = ruleTypeEnum.map((d) => ({
  label: d,
  value: d,
}));

export default function CreateRule({
  children,
  groups,
}: {
  children: React.ReactNode;
  groups: InferSelectModel<typeof GroupTable>[];
}) {
  const [open, setOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [selectedType, setSelectedType] = useState(ruleTypeEnum[0]);
  const [fromGroup, setFromGroup] = useState<string | null>(null);
  const [targetGroup, setTargetGroup] = useState<string | null>(null);
  const [gateNumber, setGateNumber] = useState(1);
  const [targetNumber, setTargetNumber] = useState(1);
  const [targetTodoName, setTargetTodoName] = useState("");
  const mutation = api.todo.createRule.useMutation();
  function onDialogOpenChange(e: boolean) {
    setOpen(e);
    setInputName("");
    setInputDescription("");
    setSelectedType(ruleTypeEnum[0]);
  }
  function handleAdd() {
    if (!inputName) {
      toast("Name is required");
      return;
    }
    if (selectedType === "conditional-add") {
      mutation
        .mutateAsync({
          ruleTitle: inputName,
          ruleDescription: inputDescription,
          ruleType: selectedType,
          ruleDetail: [
            `${fromGroup}`,
            `${targetGroup}`,
            String(targetNumber),
            targetTodoName ?? "new to-do",
          ],
          ruleGateNumber: targetNumber,
        })
        .then(() => {
          setOpen(false);
        })
        .catch((err) => alert(err));
    }
  }

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={onDialogOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={`${mutation.isPending && "cursor-wait"}`}>
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
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="rule-input-desription">description</Label>
              <Input
                id="rule-input-desription"
                value={inputDescription}
                onChange={(e) => setInputDescription(e.target.value)}
                className="col-span-3"
                maxLength={255}
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="rule-input-ruletype">rule type</Label>
              <ReactSelect
                id="rule-input-ruletype"
                options={ruleTypeOptions}
                isClearable={false}
                defaultValue={{
                  label: ruleTypeEnum[0],
                  value: ruleTypeEnum[0],
                }}
                onChange={(e) => setSelectedType(e?.value ?? ruleTypeEnum[0])}
                className="col-span-3"
              />
            </div>
            {selectedType === "conditional-add" && (
              <TypeConditionalAdd
                groups={groups}
                setFromGroup={setFromGroup}
                setTargetGroup={setTargetGroup}
                gateNumber={gateNumber}
                setGateNumber={setGateNumber}
                targetNumber={targetNumber}
                setTargetNumber={setTargetNumber}
                targetTodoName={targetTodoName}
                setTargetTodoName={setTargetTodoName}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAdd}
              className={`${mutation.isPending && "cursor-wait"}`}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

function TypeConditionalAdd(props: {
  groups: InferSelectModel<typeof GroupTable>[];
  setFromGroup: React.Dispatch<React.SetStateAction<string | null>>;
  setTargetGroup: React.Dispatch<React.SetStateAction<string | null>>;
  gateNumber: number;
  setGateNumber: React.Dispatch<React.SetStateAction<number>>;
  targetNumber: number;
  setTargetNumber: React.Dispatch<React.SetStateAction<number>>;
  targetTodoName: string;
  setTargetTodoName: React.Dispatch<React.SetStateAction<string>>;
}) {
  const {
    groups,
    setFromGroup,
    setTargetGroup,
    gateNumber,
    setGateNumber,
    targetNumber,
    setTargetNumber,
    targetTodoName,
    setTargetTodoName,
  } = props;
  const selectOptions = [
    { label: "default", value: null },
    ...groups.map((d) => ({ label: d.groupTitle, value: d.groupId })),
  ];
  return (
    <Fragment>
      <div className="grid grid-cols-4 items-center">
        <Label htmlFor="rule-input-fromgroup">from group</Label>
        <ReactSelect
          id="rule-input-fromgroup"
          options={selectOptions}
          defaultValue={
            { label: "default", value: null } as {
              label: string;
              value: string | null;
            }
          }
          onChange={(e) => setFromGroup(e?.value ?? null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center">
        <Label htmlFor="rule-input-todo-gate-number">to-do gate number</Label>
        <Input
          id="rule-input-todo-gate-number"
          value={gateNumber}
          type="number"
          onChange={(e) => setGateNumber(Number(e.target.value))}
          className="col-span-3"
          maxLength={255}
        />
      </div>
      <div className="grid grid-cols-4 items-center">
        <Label htmlFor="rule-input-targetgroup">target group</Label>
        <ReactSelect
          id="rule-input-targetgroup"
          options={selectOptions}
          defaultValue={
            { label: "default", value: null } as {
              label: string;
              value: string | null;
            }
          }
          onChange={(e) => setTargetGroup(e?.value ?? null)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center">
        <Label htmlFor="rule-input-todo-target-number">
          to-do target number
        </Label>
        <Input
          id="rule-input-todo-target-number"
          value={targetNumber}
          type="number"
          onChange={(e) => setTargetNumber(Number(e.target.value))}
          className="col-span-3"
          maxLength={255}
        />
      </div>
      <div className="grid grid-cols-4 items-center">
        <Label htmlFor="rule-input-target-name">new to-do name</Label>
        <Input
          id="rule-input-target-name"
          value={targetTodoName}
          onChange={(e) => setTargetTodoName(e.target.value)}
          className="col-span-3"
          placeholder="new to-do"
          maxLength={255}
        />
      </div>
    </Fragment>
  );
}
