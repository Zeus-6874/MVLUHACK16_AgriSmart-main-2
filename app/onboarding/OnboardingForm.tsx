"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const states = ["All India", "Maharashtra", "Punjab", "Gujarat", "Karnataka", "Andhra Pradesh"]
const landUnits = ["acre", "hectare", "bigha"]
const irrigationTypes = ["Canal", "Drip", "Sprinkler", "Rainfed", "Tube well"]

interface OnboardingFormProps {
  defaultName?: string
  defaultEmail?: string
}

export default function OnboardingForm({ defaultName = "", defaultEmail = "" }: OnboardingFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    full_name: defaultName,
    email: defaultEmail,
    phone: "",
    state: "Maharashtra",
    district: "",
    land_area: "",
    land_unit: "acre",
    primary_crop: "",
    experience_years: "",
    preferred_language: "en",
    irrigation: "",
    notes: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save profile")
      }
      toast.success("Profile saved")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message ?? "Failed to save profile")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Tell us about your farm</CardTitle>
        <CardDescription>We personalize your dashboard using this information. You can update it any time.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              required
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <Select value={form.state} onValueChange={(value) => setForm((prev) => ({ ...prev, state: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="District"
              value={form.district}
              onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Land area"
                type="number"
                value={form.land_area}
                onChange={(e) => setForm((prev) => ({ ...prev, land_area: e.target.value }))}
              />
              <Select value={form.land_unit} onValueChange={(value) => setForm((prev) => ({ ...prev, land_unit: value }))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {landUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Primary crop"
              value={form.primary_crop}
              onChange={(e) => setForm((prev) => ({ ...prev, primary_crop: e.target.value }))}
            />
            <Input
              placeholder="Experience (years)"
              type="number"
              value={form.experience_years}
              onChange={(e) => setForm((prev) => ({ ...prev, experience_years: e.target.value }))}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              value={form.preferred_language}
              onValueChange={(value) => setForm((prev) => ({ ...prev, preferred_language: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Preferred language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.irrigation} onValueChange={(value) => setForm((prev) => ({ ...prev, irrigation: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Primary irrigation" />
              </SelectTrigger>
              <SelectContent>
                {irrigationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Anything else we should know? (Optional)"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving..." : "Save and go to dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

