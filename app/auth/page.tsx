"use client"

import { useEffect } from "react"
import type React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, EyeOff, Mail } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"
import AIBackground from "@/components/ai-background"
import { Label } from "@/components/ui/label"
import { Film, AlertCircle, Check, X } from "lucide-react"

declare global {
  interface Window {
    grecaptcha: any;
    onCaptchaSuccess: (token: string) => void;
  }
}

export default function AuthPage() {
  const router = useRouter()
  const { isAuthenticated, login, signup, validatePassword } = useAuth()
  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Signup form state
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupName, setSignupName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Email Verification State
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationError, setVerificationError] = useState("")
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  // Disable autofill for all inputs
  useEffect(() => {
    const disableAutofill = () => {
      const inputs = document.querySelectorAll('input')
      inputs.forEach((input) => {
        input.setAttribute('autocomplete', 'new-password')
        input.setAttribute('data-form-type', 'other')
        input.setAttribute('data-lpignore', 'true')
        input.setAttribute('data-1p-ignore', 'true')
      })
    }

    disableAutofill()
    const timer = setInterval(disableAutofill, 1000)

    return () => clearInterval(timer)
  }, [])

  const checkPasswordRequirements = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*]/.test(password)
    })
  }

  const handleSignupPasswordChange = (newPassword: string) => {
    setSignupPassword(newPassword)
    setError("")
    checkPasswordRequirements(newPassword)
  }

  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every(req => req)
  }

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await login("google")
    } catch (error: any) {
      setError("Google login failed. Please try again.")
      console.error("Google login failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")
    try {
      await login(loginEmail, loginPassword)
      router.push("/")
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.")
      console.error("Email login failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!signupEmail || !signupPassword || !signupName) {
      setError("Please fill in all fields")
      return
    }

    if (!isPasswordValid()) {
      setError("Please ensure your password meets all requirements")
      return
    }

    if (!acceptTerms) {
      setError("Please accept the Terms & Conditions")
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      setShowVerification(true)
      setError("")
    } catch (error: any) {
      setError(error.message || "Failed to send verification code. Please try again.")
      console.error("Send verification failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("Please enter a valid 6-digit code")
      return
    }

    setLoading(true)
    setVerificationError("")
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          code: verificationCode,
          name: signupName,
          password: signupPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setVerificationError("Too many attempts. Please request a new verification code.")
          setShowVerification(false)
          setVerificationCode("")
        } else {
          setVerificationError(data.error || 'Invalid verification code')
          if (data.attemptsLeft !== undefined) {
            setAttemptsLeft(data.attemptsLeft)
          }
        }
        return
      }

      // Login successful, reload to trigger auth state update
      window.location.href = "/"
    } catch (error: any) {
      setVerificationError(error.message || "Verification failed. Please try again.")
      console.error("Email verification failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setLoading(true)
    setVerificationError("")
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification code')
      }

      setVerificationCode("")
      setAttemptsLeft(5)
      setVerificationError("New verification code sent to your email")
    } catch (error: any) {
      setVerificationError(error.message || "Failed to resend code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3 w-3 text-green-400" />
      ) : (
        <X className="h-3 w-3 text-red-400" />
      )}
      <span className={met ? "text-green-400" : "text-red-400"}>{text}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200 flex flex-col">
      {/* AI Digital Pattern Background */}
      <AIBackground />

      {/* Header */}
      <header className="py-8 px-8 relative z-50">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-3 w-fit relative z-50">
            <Film className="h-10 w-10 text-teal-400" />
            <h1 className="text-3xl font-medium text-white tracking-tight">MakeItReel</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8 px-6">
        <div className="w-full max-w-md">
          <Card className="bg-gray-900/70 border-gray-800 relative z-50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-medium text-center">Welcome to MakeItReel</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Sign in or create an account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="bg-gray-800/70 border-gray-700"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="new-password"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="#" className="text-sm text-teal-400 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="bg-gray-800/70 border-gray-700 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        autoComplete="new-password"
                        data-form-type="other"
                        data-lpignore="true"
                        data-1p-ignore="true"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-500"
                    onClick={handleEmailLogin}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  {/* Test Account Info - Only on Login Tab */}
                  <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <div className="text-blue-400 text-xs font-medium mb-2">🔐 Test Accounts:</div>
                    <div className="text-xs text-blue-300 space-y-1">
                      <div>• test@example.com (PRO)</div>
                      <div>• expert@example.com (EXPERT)</div>
                      <div>• business@example.com (BUSINESS)</div>
                      <div className="mt-1 font-medium">Password: Example1!</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Your name"
                      className="bg-gray-800/70 border-gray-700"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      autoComplete="new-password"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="bg-gray-800/70 border-gray-700"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      autoComplete="new-password"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        className="bg-gray-800/70 border-gray-700 pr-10"
                        value={signupPassword}
                        onChange={(e) => handleSignupPasswordChange(e.target.value)}
                        autoComplete="new-password"
                        data-form-type="other"
                        data-lpignore="true"
                        data-1p-ignore="true"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {signupPassword && (
                      <div className="space-y-2 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div className="text-xs font-medium text-gray-300 mb-2">Password Requirements:</div>
                        <PasswordRequirement met={passwordRequirements.length} text="At least 8 characters" />
                        <PasswordRequirement met={passwordRequirements.uppercase} text="At least 1 uppercase letter" />
                        <PasswordRequirement met={passwordRequirements.lowercase} text="At least 1 lowercase letter" />
                        <PasswordRequirement met={passwordRequirements.number} text="At least 1 number" />
                        <PasswordRequirement met={passwordRequirements.special} text="At least 1 special character (!@#$%^&*)" />
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      className="border-gray-600"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                    >
                      I accept the{" "}
                      <Link 
                        href="/terms" 
                        target="_blank"
                        className="text-teal-400 hover:underline"
                      >
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>

                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-500"
                    onClick={handleEmailSignup}
                    disabled={loading || !isPasswordValid() || !acceptTerms}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent border-gray-700 hover:bg-gray-800 hover:text-white"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                {loading ? "Connecting..." : "Continue with Google"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-800/30">
        <div className="container mx-auto text-center text-gray-500 text-sm font-light">
          {/* Removed "Built with AI" text */}
        </div>
      </footer>

      {/* New footer section */}
      <div className="mt-8 border-t border-gray-800 pt-8">
        <div className="text-sm text-gray-400">
          <div>© {new Date().getFullYear()} MakeItReel. All rights reserved.</div>
        </div>
      </div>

      {/* Email Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="sm:max-w-md bg-gray-900/80 border-gray-800 text-gray-200">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>Enter the 6-digit code sent to {signupEmail}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="123456"
                className="bg-gray-800/70 border-gray-700"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              {verificationError && (
                <p className="text-red-400 text-sm">{verificationError}</p>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={handleResendCode}
              disabled={loading}
            >
              Resend Code
            </Button>
            <Button
              type="button"
              onClick={handleVerifyEmail}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}