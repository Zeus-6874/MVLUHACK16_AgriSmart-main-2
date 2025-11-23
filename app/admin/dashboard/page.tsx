import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminDashboard from "@/components/admin/AdminDashboard"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/admin/login")
  }

  // Check if user has admin privileges
  const isAdmin = data.user.email?.includes("admin") || data.user.user_metadata?.role === "admin"
  if (!isAdmin) {
    redirect("/admin/login")
  }

  return <AdminDashboard user={data.user} />
}
