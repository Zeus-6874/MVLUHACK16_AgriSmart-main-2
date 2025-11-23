"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cloud, Sun, CloudRain, Wind, Droplets, Gauge, MapPin, RefreshCw } from "lucide-react"

interface WeatherWidgetProps {
  language: string
}

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  rainfall: number
  visibility: number
  pressure: number
  uvIndex: number
  location: string
  forecast: Array<{
    day: string
    temp: number
    condition: string
    rain: number
  }>
}

export default function WeatherWidget({ language }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async (lat?: number, lon?: number) => {
    setLoading(true)
    setError(null)

    try {
      // Use provided coordinates or default to Delhi
      const latitude = lat || 28.6139
      const longitude = lon || 77.209

      const response = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`)
      const data = await response.json()

      if (data.success) {
        setWeatherData(data.weather)
      } else {
        throw new Error(data.error || "Failed to fetch weather data")
      }
    } catch (err) {
      console.error("Weather fetch error:", err)
      setError(language === "hi" ? "मौसम डेटा लोड नहीं हो सका" : "Failed to load weather data")
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          // Handle different geolocation error types gracefully
          const errorMessages: Record<number, string> = {
            1: language === "hi" ? "स्थान पहुंच अस्वीकृत" : "Location access denied",
            2: language === "hi" ? "स्थान उपलब्ध नहीं" : "Location unavailable",
            3: language === "hi" ? "समय समाप्त" : "Location request timeout",
          }
          
          const errorMessage = errorMessages[error.code] || 
            (language === "hi" ? "स्थान प्राप्त करने में त्रुटि" : "Error getting location")
          
          // Only log if it's not a permission denied error (common case)
          if (error.code !== 1) {
            console.warn("Geolocation error:", errorMessage, error.code)
          }
          
          // Fallback to default location (Delhi)
          fetchWeatherData()
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: false, // Use less accurate but faster method
        }
      )
    } else {
      // Geolocation not supported by browser
      if (language === "hi") {
        console.info("ब्राउज़र में स्थान सेवा समर्थित नहीं है")
      } else {
        console.info("Geolocation not supported by browser")
      }
      fetchWeatherData() // Fallback to default location
    }
  }

  useEffect(() => {
    getCurrentLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
      case "clear":
        return <Sun className="h-6 w-6 text-yellow-500" />
      case "partly-cloudy":
      case "clouds":
        return <Cloud className="h-6 w-6 text-gray-500" />
      case "cloudy":
      case "overcast":
        return <Cloud className="h-6 w-6 text-gray-600" />
      case "rainy":
      case "rain":
        return <CloudRain className="h-6 w-6 text-blue-500" />
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />
    }
  }

  const getConditionText = (condition: string) => {
    const conditions = {
      sunny: language === "hi" ? "धूप" : "Sunny",
      clear: language === "hi" ? "साफ" : "Clear",
      "partly-cloudy": language === "hi" ? "आंशिक बादल" : "Partly Cloudy",
      clouds: language === "hi" ? "बादल" : "Cloudy",
      cloudy: language === "hi" ? "बादल" : "Cloudy",
      overcast: language === "hi" ? "घने बादल" : "Overcast",
      rainy: language === "hi" ? "बारिश" : "Rainy",
      rain: language === "hi" ? "बारिश" : "Rain",
    }
    return conditions[condition as keyof typeof conditions] || condition
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2">{language === "hi" ? "लोड हो रहा है..." : "Loading..."}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!weatherData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">
              {error || (language === "hi" ? "मौसम डेटा उपलब्ध नहीं" : "Weather data unavailable")}
            </p>
            <Button onClick={() => getCurrentLocation()} className="mt-2" size="sm">
              {language === "hi" ? "पुनः प्रयास करें" : "Retry"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            <span>{language === "hi" ? "मौसम" : "Weather"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{weatherData.location}</span>
            <Button onClick={() => getCurrentLocation()} size="sm" variant="ghost">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Weather */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            {getWeatherIcon(weatherData.condition)}
            <span className="text-3xl font-bold ml-2">{weatherData.temperature}°C</span>
          </div>
          <p className="text-gray-600">{getConditionText(weatherData.condition)}</p>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">{language === "hi" ? "नमी" : "Humidity"}</p>
              <p className="font-medium">{weatherData.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">{language === "hi" ? "हवा" : "Wind"}</p>
              <p className="font-medium">{weatherData.windSpeed} km/h</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">{language === "hi" ? "बारिश" : "Rainfall"}</p>
              <p className="font-medium">{weatherData.rainfall} mm</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">{language === "hi" ? "दबाव" : "Pressure"}</p>
              <p className="font-medium">{weatherData.pressure} hPa</p>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">{language === "hi" ? "5-दिन पूर्वानुमान" : "5-Day Forecast"}</h4>
          <div className="space-y-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(day.condition)}
                  <span className="text-sm font-medium">
                    {index === 0
                      ? language === "hi"
                        ? "आज"
                        : "Today"
                      : index === 1
                        ? language === "hi"
                          ? "कल"
                          : "Tomorrow"
                        : day.day}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-500">{day.rain}%</span>
                  <span className="text-sm font-medium">{day.temp}°C</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Alert */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>{language === "hi" ? "चेतावनी:" : "Alert:"}</strong>{" "}
            {language === "hi"
              ? "कल हल्की बारिश की संभावना है। सिंचाई की योजना बनाएं।"
              : "Light rain expected tomorrow. Plan irrigation accordingly."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
