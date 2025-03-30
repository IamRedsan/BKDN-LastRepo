"use client"

import type React from "react"

import { useState, type Dispatch, type SetStateAction } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Repeat, Share2, MoreHorizontal, Pencil, Trash2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/language-provider"

interface Author {
  id: string
  name: string
  username: string
  avatar: string
}

interface Post {
  id: string
  author: Author
  content: string
  images: string[]
  createdAt: string
  updatedAt: string | null
  likes: number
  comments: number
  reposts: number
  isLiked: boolean
  isReposted: boolean
  language?: string
}

interface PostDetailProps {
  post: Post
  onLike: (postId: string) => void
  onRepost: (postId: string) => void
  isOwnPost?: boolean
  isTranslated: boolean
  setIsTranslated: Dispatch<SetStateAction<boolean>>
}

// Mock comments data
const MOCK_COMMENTS = [
  {
    id: "c1",
    author: {
      id: "user4",
      name: "Sarah Williams",
      username: "sarahw",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "This is amazing! Congrats on the launch.",
    createdAt: "2023-05-15T11:30:00Z",
    updatedAt: null,
    likes: 5,
  },
  {
    id: "c2",
    author: {
      id: "user5",
      name: "Michael Brown",
      username: "mikeb",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Looking forward to checking it out!",
    createdAt: "2023-05-15T12:15:00Z",
    updatedAt: null,
    likes: 2,
  },
]

// Mock translations
const TRANSLATIONS = {
  "1": "Just launched my new website! Check it out and let me know what you think. (Translated)",
  "2": "Working on a new project using Next.js and Tailwind CSS. The developer experience is amazing! (Translated)",
  "3": "Beautiful day for a hike! 🏔️ (Translated)",
}

export default function PostDetail({
  post,
  onLike,
  onRepost,
  isOwnPost = false,
  isTranslated,
  setIsTranslated,
}: PostDetailProps) {
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [commentText, setCommentText] = useState("")
  const { t, language } = useLanguage()

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

  // Determine if post is in a different language than current UI
  const isDifferentLanguage = post.language && post.language !== language

  const handleTranslate = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsTranslated(!isTranslated)
  }

  const handleEdit = () => {
    // Handle edit functionality
    console.log("Edit post", post.id)
  }

  const handleDelete = () => {
    // Handle delete functionality
    console.log("Delete post", post.id)
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return

    const newComment = {
      id: `c${comments.length + 1}`,
      author: {
        id: "currentUser",
        name: "Current User",
        username: "currentuser",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: commentText,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      likes: 0,
    }

    setComments([newComment, ...comments])
    setCommentText("")
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <Link href={`/profile/${post.author.username}`}>
            <Image
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          </Link>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/profile/${post.author.username}`} className="font-medium hover:underline">
                  {post.author.name}
                </Link>
                <span className="text-muted-foreground"> @{post.author.username}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal size={18} />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isDifferentLanguage && (
                    <DropdownMenuItem onClick={handleTranslate}>
                      {isTranslated ? "Show original" : t("translate")}
                    </DropdownMenuItem>
                  )}
                  {post.updatedAt && <DropdownMenuItem>{t("viewEditHistory")}</DropdownMenuItem>}
                  <DropdownMenuItem>{t("reportContent")}</DropdownMenuItem>
                  {isOwnPost && (
                    <>
                      <DropdownMenuItem onClick={handleEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative">
              <p>{isTranslated ? TRANSLATIONS[post.id as keyof typeof TRANSLATIONS] || post.content : post.content}</p>

              {isDifferentLanguage && !isTranslated && (
                <button
                  onClick={handleTranslate}
                  className="mt-1 flex items-center text-xs text-primary hover:underline"
                >
                  <Globe className="mr-1 h-3 w-3" />
                  {t("translate")}
                </button>
              )}

              {isTranslated && (
                <button
                  onClick={handleTranslate}
                  className="mt-1 flex items-center text-xs text-primary hover:underline"
                >
                  <Globe className="mr-1 h-3 w-3" />
                  Show original
                </button>
              )}
            </div>

            {post.images.length > 0 && (
              <div className="mt-2 overflow-x-auto pb-2">
                <div className="flex gap-2 w-max">
                  {post.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square w-60 h-60 flex-shrink-0 overflow-hidden rounded-md"
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              {formattedDate}
              {post.updatedAt && <span> · {t("edit")}</span>}
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 ${post.isLiked ? "text-red-500" : ""}`}
                onClick={() => onLike(post.id)}
              >
                <Heart size={18} className={post.isLiked ? "fill-red-500" : ""} />
                <span>{post.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <MessageCircle size={18} />
                <span>{post.comments}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 ${post.isReposted ? "text-green-500" : ""}`}
                onClick={() => onRepost(post.id)}
              >
                <Repeat size={18} className={post.isReposted ? "fill-green-500" : ""} />
                <span>{post.reposts}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <Share2 size={18} />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Current user"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={`${t("comment")}...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="resize-none"
              />
              <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                {t("post")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-4">
                <Link href={`/profile/${comment.author.username}`}>
                  <Image
                    src={comment.author.avatar || "/placeholder.svg"}
                    alt={comment.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex items-center">
                    <Link href={`/profile/${comment.author.username}`} className="font-medium hover:underline">
                      {comment.author.name}
                    </Link>
                    <span className="text-muted-foreground ml-1">@{comment.author.username}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                  <div className="flex items-center mt-2">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <Heart size={16} />
                      <span>{comment.likes}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

