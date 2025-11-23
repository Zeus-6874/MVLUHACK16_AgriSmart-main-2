import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local first, then fallback to .env
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })
import { readFileSync } from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

interface SchemeRecord {
  name: string
  name_local?: string
  category: string
  state: string
  department?: string
  description?: string
  eligibility?: string
  benefits?: string
  subsidy_details?: string
  application_process?: string
  official_url?: string
  contact_info?: string
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }
  return createClient(url, key)
}

async function ensureCategory(name: string, supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase.from("scheme_categories").select("*").eq("name", name).maybeSingle()
  if (error) throw error
  if (data) return data.id

  const { data: inserted, error: insertError } = await supabase
    .from("scheme_categories")
    .insert({ name })
    .select()
    .single()

  if (insertError) throw insertError
  return inserted.id
}

async function seedSchemes(file = "data/schemes.sample.json") {
  const jsonPath = path.resolve(process.cwd(), file)
  const payload = JSON.parse(readFileSync(jsonPath, "utf8")) as SchemeRecord[]

  const supabase = getSupabaseClient()

  for (const record of payload) {
    const categoryId = await ensureCategory(record.category, supabase)

    const { error } = await supabase
      .from("schemes")
      .upsert(
        {
          name: record.name,
          name_local: record.name_local,
          category_id: categoryId,
          state: record.state,
          department: record.department,
          description: record.description,
          eligibility: record.eligibility,
          benefits: record.benefits,
          subsidy_details: record.subsidy_details,
          application_process: record.application_process,
          official_url: record.official_url,
          contact_info: record.contact_info,
          is_active: true,
        },
        { onConflict: "name,state" },
      )
    if (error) {
      console.error(`Failed to upsert scheme ${record.name}`, error.message)
    } else {
      console.log(`Upserted scheme: ${record.name}`)
    }
  }
}

seedSchemes(process.argv[2]).catch((error) => {
  console.error(error)
  process.exit(1)
})

