"use client";

import {type InferSelectModel } from "drizzle-orm";
import {type groups as GroupTable} from "@/server/db/schema"
import { Fragment } from "react";

export default function EditRule({
  children,
  groups,
}: {
  children: React.ReactNode;
  groups: InferSelectModel<typeof GroupTable>[];
}) {
  return <Fragment>{children}</Fragment>;
}
