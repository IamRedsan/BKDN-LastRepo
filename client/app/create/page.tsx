"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import MainLayout from "@/components/layouts/main-layout"
import { useLanguage } from "@/components/language-provider"

export default function CreatePostPage() {
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useLanguage()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => {
        // In a real app, we would upload the file to a server and get a URL
        // For now, we'll use a placeholder
        return `/placeholder.svg?height=400&width=600`
      })

      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && images.length === 0) {
      return
    }

    setLoading(true)

    // Simulate post creation
    setTimeout(() => {
      setLoading(false)
      router.push("/")
    }, 1500)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("create")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-4">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="User avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1 space-y-4">
              <Textarea
                placeholder={`${t("post")} something...`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="resize-none"
              />

              {images.length > 0 && (
                <div className={`grid gap-2 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={20} />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <Button type="submit" disabled={loading || (!content.trim() && images.length === 0)}>
                  {loading ? "Posting..." : t("post")}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

