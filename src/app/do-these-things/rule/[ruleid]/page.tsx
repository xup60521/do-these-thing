import EditRule from "@/app/_components/edit-rule";
import { Label } from "@/components/ui/label";
import { getRuleTypeColor } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import {
  type rules as RuleTable,
  type groups as GroupTable,
} from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MdEdit } from "react-icons/md";

export default async function RulePage({
  params,
}: {
  params: { ruleid: string };
}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  const { ruleid } = params;
  const rule = await db.query.rules.findFirst({
    where: (f, { and, eq }) =>
      and(eq(f.ruleId, ruleid), eq(f.ruleOwner, session.user.id)),
  });
  if (!rule) {
    redirect("/do-these-things/rule");
  }
  const groups = await db.query.groups.findMany({
    where: (f, { eq }) => eq(f.groupOwner, session.user.id),
  });
  return (
    <div className="flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="flex w-full flex-col gap-2 py-12 pt-16 text-left font-mono text-2xl font-bold">
        <div className="flex items-center gap-3">
          <span>{rule?.ruleTitle}</span>
          {rule?.ruleEnable === false && (
            <Label htmlFor="edit rule">
              <div className="w-fit cursor-pointer rounded-full bg-red-400 p-1 px-2 font-mono text-xs text-white">
                {"disabled"}
              </div>
            </Label>
          )}

          <EditRule groups={groups}>
            <button
              id="edit rule"
              className="translate-y-[0.05rem] rounded-full bg-white p-2 text-sm ring-green-200 transition hover:ring-2"
            >
              <MdEdit />
            </button>
          </EditRule>
        </div>
        <span className="flex items-center gap-2 text-sm text-neutral-500">
          {rule?.ruleDescription}
        </span>
      </h1>
       <DisplayDetail rule={rule} groups={groups} />
    </div>
  );
}

function DisplayDetail({
  rule,
  groups,
}: {
  rule: InferSelectModel<typeof RuleTable>;
  groups: InferSelectModel<typeof GroupTable>[];
}) {
  const thisFromGroup =
    groups.find((d) => d.groupId === rule.ruleDetailJson.fromGroup)
      ?.groupTitle ?? "default";
  const thisToGroup = groups.find(
    (d) => d.groupId === rule.ruleDetailJson.toGroup,
  )?.groupTitle;
  if ('targetTodoName' in rule.ruleDetailJson) {
    
      return (
        <div className="flex min-h-0 w-full min-w-0 flex-col">
          <div className="flex w-full flex-wrap">
            <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
              detail
            </div>
            <div className="flex w-full flex-grow flex-wrap gap-3 py-4">
              <div
                className={`h-fit flex w-fit flex-shrink items-center justify-center gap-1 rounded px-2 py-2 ${getRuleTypeColor({ ruleType: rule?.ruleType })}`}
              >
                <span className="w-32 text-center font-mono text-sm">
                  {rule?.ruleType}
                </span>
              </div>
              <div
                className={`h-fit flex w-fit flex-shrink items-center justify-center gap-1 rounded bg-stone-400 px-2 py-2 text-neutral-800`}
              >
                <span className="text-center font-mono text-sm">
                  {`from: ${thisFromGroup}`}
                </span>
              </div>
              <div
                className={`h-fit flex w-fit flex-shrink items-center justify-center gap-1 rounded ${getRuleTypeColor({ ruleType: rule?.ruleType })} px-2 py-2`}
              >
                <span className="text-center font-mono text-sm">
                  {`to-do gate: ${rule.ruleGateNumber}`}
                </span>
              </div>
              <div
                className={`h-fit flex w-fit flex-shrink items-center justify-center gap-1 rounded bg-neutral-500 px-2 py-2 text-white`}
              >
                <span className="text-center font-mono text-sm">
                  {`to: ${thisToGroup}`}
                </span>
              </div>
              <div
                className={`h-fit flex w-fit flex-shrink items-center justify-center gap-1 rounded bg-violet-900 px-2 py-2 text-white`}
              >
                <span className="text-center font-mono text-sm">
                  {`new to-do number: ${rule.ruleDetailJson.targetNumber}`}
                </span>
              </div>
              <div
                className={`h-fit flex w-fit flex-shrink items-center justify-center gap-1 rounded bg-violet-900 px-2 py-2 text-white`}
              >
                <span className="text-center font-mono text-sm">
                  {`new to-do name: ${rule.ruleDetailJson.targetTodoName}`}
                </span>
              </div>
            </div>
            {/* {JSON.stringify(rule)} */}
          </div>
        </div>
      );
  }
  return null
}
