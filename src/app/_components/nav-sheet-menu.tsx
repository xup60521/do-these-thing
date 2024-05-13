"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useState } from "react";
export default function NavSheetMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openNav, setOpenNav] = useState(false);
  return (
    <Sheet open={openNav} onOpenChange={setOpenNav}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col justify-center gap-2">
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-neutral-200"
              href="/do-these-things"
              onClick={() => setOpenNav(false)}
            >
              Overview
            </Link>
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-neutral-200"
              href="/do-these-things/task-library"
              onClick={() => setOpenNav(false)}
            >
              Task Library
            </Link>
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-neutral-200"
              href="/do-these-things/group"
              onClick={() => setOpenNav(false)}
            >
              Group
            </Link>
            <Link
              className="rounded-full px-4 py-2 transition hover:bg-neutral-200"
              href="/do-these-things/rule"
              onClick={() => setOpenNav(false)}
            >
              Rule
            </Link>
          </div>

          <SheetFooter className="">
            <SheetClose asChild>
              <Button className="w-fit">Close</Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
