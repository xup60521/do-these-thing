import { getServerAuthSession } from "@/server/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-stone-100">
      <header className="flex w-full items-center justify-between bg-neutral-50 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg border-2 border-violet-900 bg-violet-900 px-2 font-mono font-bold text-white">
            Do-These-Things
          </span>
          <nav className="flex font-mono text-neutral-700">
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-neutral-200"
              href="/do-these-thing"
            >
              Overview
            </Link>
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-neutral-200"
              href="/do-these-thing/task-library"
            >
              Task Library
            </Link>
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-neutral-200"
              href="/do-these-thing/group"
            >
              Groups
            </Link>
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-neutral-200"
              href="/do-these-thing/rule"
            >
              Rule
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={session?.user.image ?? ""}
                alt="user avatar"
                className="h-8 w-8 cursor-pointer rounded-full ring-violet-700 transition hover:ring-4"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link className=" cursor-pointer" href="/api/auth/signout">
                  Log out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="min-h-0 min-w-0 flex-grow flex flex-col items-center overflow-y-scroll text-black">
        {children}
      </main>
    </div>
  );
}
