export const APP_NAME = "FarmSmart"

export const LANGUAGES = {
  en: "English",
  hi: "हिंदी",
}

export const NAVIGATION_ITEMS = [
  { path: "/dashboard", icon: "🏠", labelEn: "Dashboard", labelHi: "डैशबोर्ड" },
  { path: "/soil-health", icon: "🌱", labelEn: "Soil Health", labelHi: "मिट्टी स्वास्थ्य" },
  { path: "/crop-management", icon: "🌾", labelEn: "Crops", labelHi: "फसल" },
  { path: "/weather", icon: "🌤️", labelEn: "Weather", labelHi: "मौसम" },
  { path: "/market-prices", icon: "💰", labelEn: "Market", labelHi: "बाज़ार" },
  { path: "/knowledge", icon: "📚", labelEn: "Knowledge", labelHi: "ज्ञान" },
]

export const SOIL_PARAMETERS = {
  pH: { min: 0, max: 14, optimal: [6.0, 7.5] },
  nitrogen: { min: 0, max: 100, optimal: [20, 40] },
  phosphorus: { min: 0, max: 100, optimal: [15, 30] },
  potassium: { min: 0, max: 100, optimal: [15, 25] },
  moisture: { min: 0, max: 100, optimal: [40, 60] },
}

export const CROP_SEASONS = {
  kharif: { labelEn: "Kharif (Monsoon)", labelHi: "खरीफ (मानसून)", months: "Jun-Oct" },
  rabi: { labelEn: "Rabi (Winter)", labelHi: "रबी (सर्दी)", months: "Nov-Apr" },
  zaid: { labelEn: "Zaid (Summer)", labelHi: "जायद (गर्मी)", months: "Mar-Jun" },
}
