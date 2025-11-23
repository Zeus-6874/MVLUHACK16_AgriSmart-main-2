/**
 * Agmarknet ingestion script
 * -------------------------------------
 * Fetches commodity prices from the public Agmarknet API and upserts them into Supabase.
 *
 * Usage:
 *   pnpm tsx scripts/ingest_agmarknet.ts --commodity=Wheat --state=Maharashtra
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
 */

import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local first, then fallback to .env
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })
import { createClient } from "@supabase/supabase-js"

interface CliArgs {
  commodity: string
  state: string
  limit: number
}

interface AgmarknetRecord {
  commodity: string
  variety: string
  market: string
  state: string
  district: string
  arrival_date: string
  min_price: string
  max_price: string
  modal_price: string
  unit_of_price: string
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  const defaults: CliArgs = {
    commodity: "Wheat",
    state: "Maharashtra",
    limit: 500,
  }

  for (const arg of args) {
    const [key, value] = arg.split("=")
    if (key === "--commodity" && value) defaults.commodity = value
    if (key === "--state" && value) defaults.state = value
    if (key === "--limit" && value) defaults.limit = Number(value)
  }

  return defaults
}

async function fetchAgmarknetData(commodity: string, state: string, limit: number) {
  const params = new URLSearchParams({
    commodity,
    state,
    limit: limit.toString(),
    format: "json",
  })

  const response = await fetch(`https://agmarknet.gov.in/api/commodity?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Agmarknet request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as AgmarknetRecord[]
  return data ?? []
}

async function ensureSourceRecord(supabase: ReturnType<typeof createClient>, state: string) {
  const { data, error } = await supabase
    .from("market_price_sources")
    .select("*")
    .eq("name", `Agmarknet - ${state}`)
    .maybeSingle()

  if (error) throw error

  if (data) return data.id

  const { data: inserted, error: insertError } = await supabase
    .from("market_price_sources")
    .insert({
      name: `Agmarknet - ${state}`,
      description: `Agmarknet mandi prices for ${state}`,
      source_type: "agmarknet",
      source_url: "https://agmarknet.gov.in/",
    })
    .select()
    .single()

  if (insertError) throw insertError
  return inserted.id
}

async function upsertMarketPrices(records: AgmarknetRecord[], sourceId: string) {
  const supabase = getSupabaseClient()
  const payload = records.map((record) => ({
    source_id: sourceId,
    commodity: record.commodity,
    commodity_hi: undefined,
    variety: record.variety,
    market_name: record.market,
    state: record.state,
    district: record.district,
    arrival_date: record.arrival_date,
    min_price: Number(record.min_price) || null,
    max_price: Number(record.max_price) || null,
    modal_price: Number(record.modal_price) || null,
    unit: record.unit_of_price || "quintal",
  }))

  const { error } = await supabase.from("market_prices").upsert(payload, {
    onConflict: "commodity,market_name,arrival_date",
  })

  if (error) throw error

  const { error: historyError } = await supabase.from("market_price_history").insert(
    payload.map((row) => ({
      payload: row,
    })),
  )

  if (historyError) {
    console.warn("Failed to insert market price history", historyError.message)
  }

  console.log(`Upserted ${payload.length} records for ${records[0]?.state ?? "unknown state"}`)
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Supabase credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }

  return createClient(url, key)
}

async function main() {
  const { commodity, state, limit } = parseArgs()
  console.log(`Fetching Agmarknet data for ${commodity} in ${state} (limit ${limit})...`)

  const records = await fetchAgmarknetData(commodity, state, limit)
  if (records.length === 0) {
    console.warn("No data returned from Agmarknet. Check parameters or service availability.")
    return
  }

  const supabase = getSupabaseClient()
  const sourceId = await ensureSourceRecord(supabase, state)
  await upsertMarketPrices(records, sourceId)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

