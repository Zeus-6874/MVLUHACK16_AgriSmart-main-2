"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import OnboardingForm from "./OnboardingForm"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("farmer_profiles").select("*").eq("user_id", userId).maybeSingle()
  if (profile) {
    redirect("/dashboard")
  }

  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <OnboardingForm defaultName={user?.fullName ?? ""} defaultEmail={user?.emailAddresses[0]?.emailAddress ?? ""} />
      </div>
    </div>
  )
}

