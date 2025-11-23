"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DataManager from "@/components/admin/DataManager"

export default async function AdminDataPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/admin/login")
  }

  const supabase = await createClient()

  const [{ data: schemeCategories }, { data: cropCategories }] = await Promise.all([
    supabase.from("scheme_categories").select("id,name").order("name"),
    supabase.from("crop_categories").select("id,name").order("name"),
  ])

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-semibold">Knowledge Base Admin</h1>
      <p className="text-sm text-muted-foreground">
        Manage schemes, crops, and all knowledge datasets pulled from Maharashtra horticulture board, ICAR, and CROPSAP.
      </p>
      <DataManager schemeCategories={schemeCategories ?? []} cropCategories={cropCategories ?? []} />
    </div>
  )
}

