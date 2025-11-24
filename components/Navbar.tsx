"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Globe } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { UserButton } from "@clerk/nextjs"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useI18n()

  const navItems = [
    {
      href: "/dashboard",
      label: t("nav.dashboard"),
    },
    {
      href: "/field-management",
      label: t("nav.fieldManagement"),
    },
    {
      href: "/soil-health",
      label: t("nav.soilHealth"),
    },
    {
      href: "/disease-detection",
      label: t("nav.diseaseDetection"),
    },
    {
      href: "/encyclopedia",
      label: t("nav.encyclopedia"),
    },
    {
      href: "/weather",
      label: t("nav.weather"),
    },
    {
      href: "/market-prices",
      label: t("nav.marketPrices"),
    },
    {
      href: "/knowledge",
      label: t("nav.knowledge"),
    },
  ]

  const isActive = (href: string) => pathname === href

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en")
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2" aria-label="AgriSmart Home">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">AS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AgriSmart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-green-600 ${
                  isActive(item.href) ? "text-green-600 border-b-2 border-green-600 pb-1" : "text-gray-700"
                }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Language Toggle, User Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-1"
              aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span>{language === "en" ? "हिं" : "EN"}</span>
            </Button>
            <div className="hidden sm:block">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-green-600 ${
                        isActive(item.href) ? "text-green-600" : "text-gray-700"
                      }`}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Button
                    variant="ghost"
                    onClick={toggleLanguage}
                    className="flex items-center space-x-2 justify-start mt-8"
                    aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
                  >
                    <Globe className="h-4 w-4" aria-hidden="true" />
                    <span>{language === "en" ? "Switch to Hindi" : "Switch to English"}</span>
                  </Button>
                  
                  <div className="mt-4 pt-4 border-t">
                    <UserButton afterSignOutUrl="/sign-in" />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
