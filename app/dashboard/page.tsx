import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardClient from "./DashboardClient"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = await createClient()
  const { data: profile } = await supabase.from("farmer_profiles").select("*").eq("user_id", userId).maybeSingle()

  if (!profile) {
    redirect("/onboarding")
  }

  const user = await currentUser()

  return <DashboardClient profile={profile} clerkUser={user} />
}

