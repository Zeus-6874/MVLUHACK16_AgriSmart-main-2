"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import WeatherWidget from "@/components/WeatherWidget"
import { Droplets, AlertTriangle, Info, Bell, Thermometer } from "lucide-react"

export default function WeatherAlerts() {
  const [language, setLanguage] = useState("en")

  const weatherAlerts = [
    {
      type: "warning",
      title: language === "hi" ? "भारी बारिश चेतावनी" : "Heavy Rainfall Warning",
      message:
        language === "hi"
          ? "48 घंटों में 50-75mm बारिश की संभावना। जल निकासी की व्यवस्था करें।"
          : "Expected 50-75mm rainfall in next 48 hours. Prepare drainage systems.",
      time: "2 hours ago",
      severity: "high",
    },
    {
      type: "info",
      title: language === "hi" ? "अनुकूल तापमान" : "Favorable Temperature",
      message:
        language === "hi"
          ? "गेहूं के अंकुरण के लिए आदर्श तापमान (20-25°C) अगले सप्ताह तक बना रहेगा।"
          : "Ideal temperature for wheat germination (20-25°C) will continue next week.",
      time: "6 hours ago",
      severity: "low",
    },
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "caution":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-orange-200 bg-orange-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "hi" ? "मौसम अलर्ट और सिंचाई गाइड" : "Weather Alerts & Irrigation Guide"}
          </h1>
          <p className="text-gray-600">
            {language === "hi"
              ? "मौसम की जानकारी और सिंचाई के सुझाव प्राप्त करें"
              : "Get weather information and irrigation recommendations"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Weather */}
            <WeatherWidget language={language} />

            {/* Weather Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  {language === "hi" ? "मौसम अलर्ट" : "Weather Alerts"}
                  <Badge variant="secondary">{weatherAlerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weatherAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${getAlertColor(alert.severity)}`}>
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{alert.title}</h3>
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                        <p className="text-sm text-gray-700">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "hi" ? "मौसम आंकड़े" : "Weather Statistics"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{language === "hi" ? "औसत तापमान" : "Avg Temperature"}</span>
                  </div>
                  <span className="font-bold">26°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{language === "hi" ? "कुल बारिश" : "Total Rainfall"}</span>
                  </div>
                  <span className="font-bold">85mm</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "hi" ? "त्वरित कार्य" : "Quick Actions"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Bell className="h-4 w-4 mr-2" />
                  {language === "hi" ? "अलर्ट सेट करें" : "Set Alerts"}
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Droplets className="h-4 w-4 mr-2" />
                  {language === "hi" ? "सिंचाई प्लान करें" : "Plan Irrigation"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
