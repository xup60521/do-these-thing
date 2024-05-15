"use client";

import { type InferSelectModel } from "drizzle-orm";
import {
  RuleDetailJson_ConditionalAddSchema,
  RuleDetailJson_PlannedToggleGroupSchema,
  type groups as GroupTable,
  type rules as RuleTable,
} from "@/server/db/schema";
import { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { type z } from "zod";
import ReactSelect from "react-select";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface ConditionalAddRuleType
  extends Omit<InferSelectModel<typeof RuleTable>, "ruleDetailJson"> {
  ruleDetailJson: z.infer<typeof RuleDetailJson_ConditionalAddSchema>;
}
interface PlannedToggleGroupRuleType
  extends Omit<InferSelectModel<typeof RuleTable>, "ruleDetailJson"> {
  ruleDetailJson: z.infer<typeof RuleDetailJson_PlannedToggleGroupSchema>;
}

export default function EditRule(props: {
  children: React.ReactNode;
  groups: InferSelectModel<typeof GroupTable>[];
  rule: InferSelectModel<typeof RuleTable>;
}) {
  const { rule } = props;
  if (
    rule.ruleType === "conditional-add" &&
    "targetNumber" in rule.ruleDetailJson &&
    "targetTodoName" in rule.ruleDetailJson
  ) {
    const conditionalAddRule = rule as ConditionalAddRuleType;
    return (
      <TypeConditionalAdd groups={props.groups} rule={conditionalAddRule}>
        {props.children}
      </TypeConditionalAdd>
    );
  }
  if (
    rule.ruleType === "planned-toggle-group" &&
    "targetInvisibility" in rule.ruleDetailJson
  ) {
    const plannedToggleGroupRule = rule as PlannedToggleGroupRuleType;
    return (
      <TypePlannedToggleGroup
        groups={props.groups}
        rule={plannedToggleGroupRule}
      >
        {props.children}
      </TypePlannedToggleGroup>
    );
  }
  return <Fragment>{props.children}</Fragment>;
}

function TypeConditionalAdd({
  children,
  groups,
  rule,
}: {
  children: React.ReactNode;
  groups: InferSelectModel<typeof GroupTable>[];
  rule: ConditionalAddRuleType;
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [inputEnable, setInputEnable] = useState(rule.ruleEnable);
  const [inputTitle, setInputTitle] = useState(rule.ruleTitle);
  const [inputDescription, setInputDescription] = useState(
    rule.ruleDescription ?? "",
  );
  const [inputFromGroup, setInputFromGroup] = useState(
    rule.ruleDetailJson.fromGroup,
  );
  const [gateNumber, setGateNumber] = useState(rule.ruleGateNumber);
  const [inputToGroup, setInputToGroup] = useState(rule.ruleDetailJson.toGroup);
  const [targetNumber, setTargetNumber] = useState(
    rule.ruleDetailJson.targetNumber,
  );
  const [targetName, setTargetName] = useState(
    rule.ruleDetailJson.targetTodoName,
  );
  const mutation = api.todo.updateRule.useMutation();
  const deleteRuleMutation = api.todo.deleteRule.useMutation();
  const router = useRouter();
  const selectGroupOptions = [
    { label: "default", value: null },
    ...groups.map((d) => ({ label: d.groupTitle, value: d.groupId })),
  ];

  function onDialogClose(e: boolean) {
    setOpenDialog(e);
    setInputEnable(rule.ruleEnable);
    setInputTitle(rule.ruleTitle);
    setInputDescription(rule.ruleDescription ?? "");
    setInputFromGroup(rule.ruleDetailJson.fromGroup);
    setGateNumber(rule.ruleGateNumber);
    setInputToGroup(rule.ruleDetailJson.toGroup);
    setTargetNumber(rule.ruleDetailJson.targetNumber);
    setTargetName(rule.ruleDetailJson.targetTodoName);
  }
  function handleSave() {
    setOpenDialog(false);
    mutation
      .mutateAsync({
        ruleId: rule.ruleId,
        ruleTitle: inputTitle,
        ruleDescription: inputDescription,
        ruleDetailJson: {
          fromGroup: inputFromGroup,
          toGroup: inputToGroup,
          targetNumber,
          targetTodoName: targetName === "" ? "new to-do" : targetName,
        },
        ruleGateNumber: gateNumber,
        ruleEnable: inputEnable,
      })
      .then(() => {
        setOpenDialog(false);
        router.refresh();
      })
      .catch((err) => alert(err));
  }
  function handleDeleteRule() {
    if (!rule.ruleId) {
      return;
    }
    deleteRuleMutation
      .mutateAsync({
        ruleId: rule.ruleId,
      })
      .then(() => {
        setOpenAlert(false);
        router.refresh();
      })
      .catch((err) => alert(err));
  }
  return (
    <Fragment>
      <Dialog open={openDialog} onOpenChange={onDialogClose}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={`${mutation.isPending && "cursor-wait"}`}>
          <DialogHeader>
            <DialogTitle>Edit Rule</DialogTitle>
            <DialogDescription>
              Note: if changing rule detail. It would act like a new rule.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-enable">enable</Label>
              <Checkbox
                id="input-enable"
                checked={inputEnable}
                onCheckedChange={() => setInputEnable(!inputEnable)}
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-rule-title">name</Label>
              <Input
                id="input-rule-title"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-rule-description">description</Label>
              <Input
                id="input-rule-description"
                value={inputDescription ?? ""}
                onChange={(e) => setInputDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-rule-fromGroup">from group</Label>
              <ReactSelect
                id="input-rule-fromGroup"
                options={selectGroupOptions}
                defaultValue={selectGroupOptions.find(
                  (d) => d.value === inputFromGroup,
                )}
                onChange={(e) => setInputFromGroup(e?.value ?? null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="rule-input-todo-gate-number">
                to-do gate number
              </Label>
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
              <Label htmlFor="rule-input-toGroup">target group</Label>
              <ReactSelect
                id="rule-input-toGroup"
                options={selectGroupOptions}
                defaultValue={selectGroupOptions.find(
                  (d) => d.value === inputToGroup,
                )}
                onChange={(e) => setInputToGroup(e?.value ?? null)}
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
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                className="col-span-3"
                placeholder="new to-do"
                maxLength={255}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={() => {
                setOpenDialog(false);
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
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent
          className={`${deleteRuleMutation.isPending && "cursor-wait"}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete a rule</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteRule}
              className={`${deleteRuleMutation.isPending && "cursor-wait"}`}
            >
              Sure
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}

function TypePlannedToggleGroup({
  children,
  groups,
  rule,
}: {
  children: React.ReactNode;
  groups: InferSelectModel<typeof GroupTable>[];
  rule: PlannedToggleGroupRuleType;
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [inputEnable, setInputEnable] = useState(rule.ruleEnable);
  const [inputTitle, setInputTitle] = useState(rule.ruleTitle);
  const [inputDescription, setInputDescription] = useState(
    rule.ruleDescription ?? "",
  );
  const [inputFromGroup, setInputFromGroup] = useState(
    rule.ruleDetailJson.fromGroup,
  );
  const [gateNumber, setGateNumber] = useState(rule.ruleGateNumber);
  const [inputToGroup, setInputToGroup] = useState(rule.ruleDetailJson.toGroup);
  const [targetInvisible, setTargetInvisible] = useState(rule.ruleDetailJson.targetInvisibility)
  const mutation = api.todo.updateRule.useMutation();
  const deleteRuleMutation = api.todo.deleteRule.useMutation();
  const router = useRouter();
  const selectGroupOptions = [
    { label: "default", value: null },
    ...groups.map((d) => ({ label: d.groupTitle, value: d.groupId })),
  ];
  const selectnvisibilityOptions = [{
    label: "show", value: false
  }, {
    label: "hidden", value: true
  }]
  const targetSelectedGroupOptions = [...groups.map((d) => ({ label: d.groupTitle, value: d.groupId }))]

  function onDialogClose(e: boolean) {
    setOpenDialog(e);
    setInputEnable(rule.ruleEnable);
    setInputTitle(rule.ruleTitle);
    setInputDescription(rule.ruleDescription ?? "");
    setInputFromGroup(rule.ruleDetailJson.fromGroup);
    setGateNumber(rule.ruleGateNumber);
    setInputToGroup(rule.ruleDetailJson.toGroup);
    setTargetInvisible(rule.ruleDetailJson.targetInvisibility);
  }
  function handleSave() {
    setOpenDialog(false);
    mutation
      .mutateAsync({
        ruleId: rule.ruleId,
        ruleTitle: inputTitle,
        ruleDescription: inputDescription,
        ruleDetailJson: {
          fromGroup: inputFromGroup,
          toGroup: inputToGroup,
          targetInvisibility: targetInvisible
        },
        ruleGateNumber: gateNumber,
        ruleEnable: inputEnable,
      })
      .then(() => {
        setOpenDialog(false);
        router.refresh();
      })
      .catch((err) => alert(err));
  }
  function handleDeleteRule() {
    if (!rule.ruleId) {
      return;
    }
    deleteRuleMutation
      .mutateAsync({
        ruleId: rule.ruleId,
      })
      .then(() => {
        setOpenAlert(false);
        router.refresh();
      })
      .catch((err) => alert(err));
  }
  return (
    <Fragment>
      <Dialog open={openDialog} onOpenChange={onDialogClose}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={`${mutation.isPending && "cursor-wait"}`}>
          <DialogHeader>
            <DialogTitle>Edit Rule</DialogTitle>
            <DialogDescription>
              Note: if changing rule detail. It would act like a new rule.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-enable">enable</Label>
              <Checkbox
                id="input-enable"
                checked={inputEnable}
                onCheckedChange={() => setInputEnable(!inputEnable)}
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-rule-title">name</Label>
              <Input
                id="input-rule-title"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-rule-description">description</Label>
              <Input
                id="input-rule-description"
                value={inputDescription ?? ""}
                onChange={(e) => setInputDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="input-rule-fromGroup">from group</Label>
              <ReactSelect
                id="input-rule-fromGroup"
                options={selectGroupOptions}
                defaultValue={selectGroupOptions.find(
                  (d) => d.value === inputFromGroup,
                )}
                onChange={(e) => setInputFromGroup(e?.value ?? null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="rule-input-todo-gate-number">
                to-do gate number
              </Label>
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
              <Label htmlFor="rule-input-toGroup">target group</Label>
              <ReactSelect
                id="rule-input-toGroup"
                options={targetSelectedGroupOptions}
                defaultValue={targetSelectedGroupOptions.find(
                  (d) => d.value === inputToGroup,
                )}
                onChange={(e) => setInputToGroup(e?.value ?? null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center">
              <Label htmlFor="rule-input-todo-target-invisible">
                target invisibility
              </Label>
              <ReactSelect
                id="rule-input-todo-target-invisible"
                options={selectnvisibilityOptions}
                defaultValue={selectnvisibilityOptions.find(d => d.value === targetInvisible)}
                onChange={(e) => setTargetInvisible(e?.value ?? false)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={() => {
                setOpenDialog(false);
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
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent
          className={`${deleteRuleMutation.isPending && "cursor-wait"}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete a rule</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteRule}
              className={`${deleteRuleMutation.isPending && "cursor-wait"}`}
            >
              Sure
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}
