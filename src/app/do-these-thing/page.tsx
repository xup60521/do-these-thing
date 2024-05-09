import { getServerAuthSession } from "@/server/auth"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await getServerAuthSession()
    if (!session) {
        redirect("/")
    }
    return <div className="max-w-full w-[70rem] flex flex-col">
        <h1 className="text-2xl font-bold font-mono py-16 w-full text-left">
            Overview
        </h1>
        <div className="w-full flex min-w-0">
            <div></div>
        </div>
    </div>
}