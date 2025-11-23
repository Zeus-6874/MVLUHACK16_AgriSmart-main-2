import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local first, then fallback to .env
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })
import { readFileSync } from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

interface CropsapRecord {
  reference_id?: string
  district?: string
  taluka?: string
  village?: string
  crop: string
  pest?: string
  disease?: string
  severity?: string
  advisory?: string
  reported_on?: string
  source_url?: string
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }
  return createClient(url, key)
}

async function seedCropsap(file = "data/cropsap.sample.json") {
  const jsonPath = path.resolve(process.cwd(), file)
  const payload = JSON.parse(readFileSync(jsonPath, "utf8")) as CropsapRecord[]

  const supabase = getSupabaseClient()

  const { error } = await supabase.from("cropsap_alerts").upsert(
    payload.map((record) => ({
      reference_id: record.reference_id,
      district: record.district,
      taluka: record.taluka,
      village: record.village,
      crop: record.crop,
      pest: record.pest,
      disease: record.disease,
      severity: record.severity,
      advisory: record.advisory,
      reported_on: record.reported_on ? new Date(record.reported_on).toISOString().slice(0, 10) : null,
      source_url: record.source_url,
    })),
    { onConflict: "reference_id" },
  )

  if (error) {
    console.error("Failed to seed CROPSAP data", error.message)
    process.exit(1)
  }

  console.log(`Seeded ${payload.length} CROPSAP alerts`)
}

seedCropsap(process.argv[2]).catch((error) => {
  console.error(error)
  process.exit(1)
})

