"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    // Use the logout function from auth context
    logout()

    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }, [logout, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-lg">Logging out...</div>
    </div>
  )
}