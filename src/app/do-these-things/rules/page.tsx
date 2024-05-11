import CreateRule from "@/app/_components/create-rule";
import { Label } from "@/components/ui/label";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";

export default async function Rule() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  const rules = await db.query.rules.findMany({
    where: (f, {eq}) => eq(f.ruleOwner, session.user.id)
  })
  const groups = await db.query.groups.findMany({
    where: (f, {eq}) => eq(f.groupOwner, session.user.id)
  })
  return (
    <div className="flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="w-full py-16 text-left font-mono text-2xl font-bold">
        <span>Rules</span>
      </h1>
      <div className="flex min-h-0 w-full min-w-0 flex-col">
        <div className="flex w-full flex-wrap">
          <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
            <Label
              htmlFor="new group button"
              className="cursor-pointer font-bold"
            >
              New Rule
            </Label>
            <CreateRule groups={groups}>
              <button
                id="new group button"
                className="size-6 rounded-full bg-white text-sm text-neutral-500 ring-green-200 transition hover:ring-2"
              >
                +
              </button>
            </CreateRule>
          </div>
          <div className="flex w-full flex-grow flex-wrap gap-2 py-4">
            {JSON.stringify(rules.filter(d => d.ruleEnable))}
          </div>
          <div className="flex w-full items-center gap-2 border-b-[1px] border-neutral-400 py-2 font-bold text-neutral-500">
            <span>disabled</span>
          </div>
          <div className="flex w-full flex-grow flex-wrap gap-2 py-4">
          {JSON.stringify(rules.filter(d => !d.ruleEnable))}
          </div>
        </div>
      </div>
    </div>
  );
}
