"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/components/language-provider"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate login
    setTimeout(() => {
      setLoading(false)
      router.push("/")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Threads</h1>
          <p className="mt-2 text-muted-foreground">{t("login")}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : t("login")}
          </Button>

          <Separator className="my-4" />

          <div className="space-y-4">
            <Button variant="outline" className="w-full" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </Button>

            <Button variant="outline" className="w-full" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M9.5 3H14.5C17.5376 3 20 5.46243 20 8.5V15.5C20 18.5376 17.5376 21 14.5 21H9.5C6.46243 21 4 18.5376 4 15.5V8.5C4 5.46243 6.46243 3 9.5 3Z"
                  fill="#1877F2"
                />
                <path
                  d="M16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12V17H10V12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12V17H16V12Z"
                  fill="white"
                />
                <circle cx="12" cy="6" r="1" fill="white" />
              </svg>
              Facebook
            </Button>

            <Button variant="outline" className="w-full" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                  fill="black"
                />
                <path
                  d="M15.6257 11.5293C15.6095 9.70293 17.0755 8.59893 17.1367 8.55693C16.1567 7.10093 14.6247 6.89893 14.0797 6.88493C12.7967 6.74893 11.5577 7.62493 10.9047 7.62493C10.2367 7.62493 9.22369 6.89893 8.16769 6.92093C6.76369 6.94293 5.45769 7.75693 4.72769 9.02893C3.22369 11.6169 4.36769 15.4129 5.81369 17.4769C6.52769 18.4889 7.37369 19.6209 8.46769 19.5769C9.53369 19.5289 9.9377 18.8729 10.2127 18.8729C11.1327 18.8729 11.5137 19.5769 12.6377 19.5529C13.7997 19.5289 14.5457 18.5169 15.2377 17.4969C16.0657 16.3169 16.4047 15.1689 16.4207 15.1129C16.3887 15.1009 15.6437 14.8209 15.6257 11.5293Z"
                  fill="white"
                />
                <path
                  d="M14.2337 5.68506C14.8297 4.94706 15.2337 3.92506 15.1177 2.88306C14.2657 2.91706 13.2017 3.47106 12.5737 4.19306C12.0177 4.83706 11.5337 5.88306 11.6657 6.89906C12.6257 6.96506 13.6217 6.41106 14.2337 5.68506Z"
                  fill="white"
                />
              </svg>
              Apple
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("register")}?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              {t("register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

