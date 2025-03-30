import MainLayout from "@/components/layouts/main-layout"
import FeedPage from "@/components/feed/feed-page"

export default function Home() {
  // In a real app, check if user is authenticated
  // If not, redirect to login page
  // const isAuthenticated = false
  // if (!isAuthenticated) {
  //   redirect("/auth/login")
  // }

  return (
    <MainLayout>
      <FeedPage />
    </MainLayout>
  )
}

