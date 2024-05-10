import { getServerAuthSession } from "@/server/auth"
import { redirect } from "next/navigation"

export default async function GroupId({params}:{params: {groupid: string}}) {
    const session = await getServerAuthSession()
    if (!session) {redirect("/")}
    return params.groupid
}