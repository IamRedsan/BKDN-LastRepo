"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, LinkIcon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import MainLayout from "@/components/layouts/main-layout"
import { useLanguage } from "@/components/language-provider"

// Mock user data
const USER = {
  id: "user1",
  name: "Jane Smith",
  username: "janesmith",
  avatar: "/placeholder.svg?height=100&width=100",
  banner: "/placeholder.svg?height=300&width=1200",
  bio: "Product Designer | UI/UX Enthusiast | Creating digital experiences that people love",
  website: "https://janesmith.design",
}

export default function EditProfilePage() {
  const [name, setName] = useState(USER.name)
  const [username, setUsername] = useState(USER.username)
  const [bio, setBio] = useState(USER.bio)
  const [website, setWebsite] = useState(USER.website)
  const [avatar, setAvatar] = useState(USER.avatar)
  const [banner, setBanner] = useState(USER.banner)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      router.push("/profile")
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("editProfile")}</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="h-48 w-full overflow-hidden rounded-lg bg-muted">
                <Image src={banner || "/placeholder.svg"} alt="Profile banner" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <Button variant="secondary" size="icon">
                    <Camera size={20} />
                  </Button>
                </div>
              </div>

              <div className="absolute -bottom-16 left-4 h-32 w-32 overflow-hidden rounded-full border-4 border-background">
                <Image src={avatar || "/placeholder.svg"} alt="Profile avatar" fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <Button variant="secondary" size="icon">
                    <Camera size={20} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("displayName")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">{t("username")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">@</span>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("bio")}</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t("website")}</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : t("save")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
              {t("cancel")}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

