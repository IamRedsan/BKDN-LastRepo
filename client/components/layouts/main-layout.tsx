"use client"

import type React from "react"

import { useState } from "react"
import Sidebar from "@/components/navigation/sidebar"
import MobileNav from "@/components/navigation/mobile-nav"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="flex min-h-screen bg-background">
      {!isMobile && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}
      <main className={`flex-1 ${!isMobile && sidebarOpen ? "ml-64" : "ml-0"} transition-all duration-300`}>
        <div className="container mx-auto max-w-4xl px-4 py-4">{children}</div>
      </main>

      {isMobile && <MobileNav />}
    </div>
  )
}

