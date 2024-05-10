import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function TaskLibrary() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  return (
    <div className="flex w-[70rem] max-w-full flex-col px-16">
      <h1 className="w-full py-16 text-left font-mono text-2xl font-bold">
        Task Library
      </h1>
      <div className="flex w-full min-w-0">
        <div></div>
      </div>
    </div>
  );
}
