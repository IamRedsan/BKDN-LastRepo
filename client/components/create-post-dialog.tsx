"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"

interface CreatePostDialogProps {
  trigger: React.ReactNode
}

export default function CreatePostDialog({ trigger }: CreatePostDialogProps) {
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => {
        // In a real app, we would upload the file to a server and get a URL
        // For now, we'll use a placeholder
        return URL.createObjectURL(file)
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
      setContent("")
      setImages([])
      setOpen(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("create")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative rounded-md border overflow-hidden">
                      <div className="flex items-center p-2">
                        <div className="h-16 w-16 relative mr-2">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Upload preview ${index + 1}`}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-sm truncate">Image {index + 1}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(index)}
                          className="ml-auto"
                        >
                          <X size={16} />
                        </Button>
                      </div>
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
      </DialogContent>
    </Dialog>
  )
}

