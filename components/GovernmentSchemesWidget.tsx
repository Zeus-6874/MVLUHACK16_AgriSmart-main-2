"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

interface GovernmentSchemesWidgetProps {
  language: string
}

interface Scheme {
  id: string
  scheme_name: string
  description: string
  category: string
  beneficiaries_count?: number
  website_url?: string
}

export default function GovernmentSchemesWidget({ language }: GovernmentSchemesWidgetProps) {
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(true)

  const featuredSchemes: Scheme[] = [
    {
      id: "1",
      scheme_name: "PM-KISAN",
      description:
        language === "hi" ? "₹6000 प्रति वर्ष सीधे किसानों के खाते में" : "₹6000 per year directly to farmers accounts",
      category: "Income Support",
      beneficiaries_count: 11000000,
      website_url: "https://pmkisan.gov.in",
    },
    {
      id: "2",
      scheme_name: language === "hi" ? "फसल बीमा योजना" : "Crop Insurance Scheme",
      description: language === "hi" ? "प्राकृतिक आपदाओं से फसल सुरक्षा" : "Crop protection against natural disasters",
      category: "Insurance",
      beneficiaries_count: 5500000,
      website_url: "https://pmfby.gov.in",
    },
    {
      id: "3",
      scheme_name: language === "hi" ? "किसान क्रेडिट कार्ड" : "Kisan Credit Card",
      description: language === "hi" ? "4% ब्याज दर पर कृषि ऋण" : "Agricultural loans at 4% interest rate",
      category: "Credit",
      beneficiaries_count: 7000000,
      website_url: "https://kcc.gov.in",
    },
  ]

  useEffect(() => {
    fetchFeaturedSchemes()
  }, [])

  const fetchFeaturedSchemes = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/schemes?limit=3")
      const data = await response.json()

      if (data.success && data.schemes.length > 0) {
        setSchemes(data.schemes.slice(0, 3))
      } else {
        setSchemes(featuredSchemes)
      }
    } catch (error) {
      console.error("Failed to fetch schemes:", error)
      setSchemes(featuredSchemes)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "Income Support": "bg-green-100 text-green-800",
      Insurance: "bg-blue-100 text-blue-800",
      Credit: "bg-purple-100 text-purple-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>{language === "hi" ? "सरकारी योजनाएं" : "Government Schemes"}</span>
          </div>
          <Link href="/schemes">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{scheme.scheme_name}</h4>
                  <Badge className={`${getCategoryColor(scheme.category)} text-xs`}>{scheme.category}</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{scheme.description}</p>

                {scheme.beneficiaries_count && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>
                      {(scheme.beneficiaries_count / 1000000).toFixed(1)}M{" "}
                      {language === "hi" ? "लाभार्थी" : "beneficiaries"}
                    </span>
                  </div>
                )}

                {scheme.website_url && (
                  <Button asChild size="sm" variant="outline" className="w-full text-xs h-7 bg-transparent">
                    <a
                      href={scheme.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {language === "hi" ? "आवेदन करें" : "Apply Now"}
                    </a>
                  </Button>
                )}
              </div>
            ))}

            <div className="pt-2 border-t">
              <Link href="/schemes">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  {language === "hi" ? "सभी योजनाएं देखें" : "View All Schemes"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
