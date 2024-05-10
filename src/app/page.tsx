import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaGithub } from "react-icons/fa";

export default async function Page() {
  const session = await getServerAuthSession();
  if (session) {
    redirect("/do-these-things");
  }
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-16 overflow-hidden bg-gradient-to-b from-neutral-900 to-violet-900 text-white">
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <h1 className="rounded-3xl border-[1rem] border-double border-violet-200 px-12 text-center font-mono text-[7.5rem] text-violet-200">
          DoTheseThing
        </h1>
        <p className="font-mono">Complete task, trigger next steps.</p>
      </div>
      <Link
        className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-neutral-900 transition hover:bg-neutral-100"
        href="/api/auth/signin"
      >
        <span>
          <FaGithub />
        </span>
        Log in with Github
      </Link>
    </div>
  );
}
