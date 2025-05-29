"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Check, Info } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { user } = useAuth()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "expert" | "business">("expert")
  const [mounted, setMounted] = useState(false)

  const userHasActivePlan = user?.subscription?.status === "active"
  const userCurrentPlan = user?.subscription?.plan

  useEffect(() => {
    setMounted(true)
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!mounted || !isOpen) return null

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white z-10 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 text-center">
          {!userHasActivePlan ? (
            <>
              <h2 className="text-2xl font-medium text-white">🔒 Subscription Required</h2>
              <p className="text-gray-300 mt-2">You need an active subscription to generate AI shorts. Choose a plan below:</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-medium text-white">Choose Your Plan</h2>
              <p className="text-gray-300 mt-2">Save big with yearly billing - up to 20% off!</p>
            </>
          )}

          <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-gradient-to-r from-teal-400/10 to-green-400/10 rounded-lg border border-teal-400/20">
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-white" : "text-gray-400"}`}>Monthly</span>
            <Switch
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              className="data-[state=checked]:bg-teal-400"
            />
            <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-white" : "text-gray-400"}`}>Yearly</span>
            {billingCycle === "yearly" && (
              <span className="bg-green-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                SAVE 20%
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {/* PRO Plan */}
            <Card 
              className={`bg-gray-800/50 backdrop-blur-sm cursor-pointer transition-all duration-200 ${
                selectedPlan === "pro" 
                  ? "border-teal-400 shadow-lg" 
                  : "border-gray-600"
              }`}
              onClick={() => setSelectedPlan("pro")}
            >
              <CardHeader className="pb-4">
                <div className="bg-teal-400/20 text-teal-400 py-1 px-3 rounded-full text-xs font-medium w-fit mx-auto mb-2">
                  PRO
                </div>
                <div className="text-amber-400 text-xs font-medium mb-2 mx-auto w-fit bg-amber-400/20 px-2 py-1 rounded">⚡ LIMITED TIME: SAVE 20%</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-400 line-through text-xl">${billingCycle === "yearly" ? "360" : "30"}</span>
                  <span className="text-3xl font-bold text-white">${billingCycle === "yearly" ? "288" : "30"}</span>
                </div>
                <CardDescription className="text-center text-gray-300">
                  {billingCycle === "yearly" ? "per year (save $72!)" : "per month"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">360 input videos (per year)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-200">Max 10 Minutes Timeframe</span>
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">No watermark</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Auto Curation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Auto Face Tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Auto Captioning</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Auto Transition & SFX</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Auto Hook Title</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Auto CTA</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Caption Translation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Autopost and scheduler</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">1 social account connection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Downloader - 1080P/4K</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Downloader - MP3</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Transcript</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Clipper Analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Creator Analysis</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-teal-400 hover:bg-teal-500 text-black font-medium">Upgrade to PRO</Button>
              </CardFooter>
            </Card>

            {/* EXPERT Plan */}
            <Card 
              className={`bg-gray-800/50 backdrop-blur-sm relative overflow-hidden cursor-pointer transition-all duration-200 ${
                selectedPlan === "expert" 
                  ? "border-teal-400 shadow-lg" 
                  : "border-gray-600"
              }`}
              onClick={() => setSelectedPlan("expert")}
            >
              {selectedPlan === "expert" && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-teal-400"></div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-teal-400/20 text-teal-400 py-1 px-3 rounded-full text-xs font-medium">
                    EXPERT
                  </div>
                  {userHasActivePlan && userCurrentPlan === "expert" && (
                    <Badge className="bg-green-600 text-white text-xs">ACTIVE</Badge>
                  )}
                </div>
                <div className="text-amber-400 text-xs font-medium mb-2 mx-auto w-fit bg-amber-400/20 px-2 py-1 rounded">⚡ LIMITED TIME: SAVE 20%</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-400 line-through text-xl">${billingCycle === "yearly" ? "720" : "60"}</span>
                  <span className="text-3xl font-bold text-white">${billingCycle === "yearly" ? "576" : "60"}</span>
                </div>
                <CardDescription className="text-center text-gray-300">
                  {billingCycle === "yearly" ? "per year (save $144!)" : "per month"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Everything in Pro Plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">720 input videos (per year)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-200">Max 20 Minutes Timeframe</span>
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">3 social account connections</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Downloader - 1080P/4K</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Downloader - MP3</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Transcript</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Clipper Analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Creator Analysis</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-teal-400 hover:bg-teal-500 text-black font-medium"
                  disabled={userHasActivePlan && userCurrentPlan === "expert"}
                >
                  {userHasActivePlan && userCurrentPlan === "expert" ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Current Plan
                    </span>
                  ) : "Upgrade to EXPERT"}
                </Button>
              </CardFooter>
            </Card>

            {/* BUSINESS Plan */}
            <Card 
              className={`bg-gray-800/50 backdrop-blur-sm cursor-pointer transition-all duration-200 ${
                selectedPlan === "business" 
                  ? "border-teal-400 shadow-lg" 
                  : "border-gray-600"
              }`}
              onClick={() => setSelectedPlan("business")}
            >
              <CardHeader className="pb-4">
                <div className="bg-teal-400/20 text-teal-400 py-1 px-3 rounded-full text-xs font-medium w-fit mx-auto mb-2">
                  BUSINESS
                </div>
                <div className="text-amber-400 text-xs font-medium mb-2 mx-auto w-fit bg-amber-400/20 px-2 py-1 rounded">⚡ LIMITED TIME: SAVE 20%</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-400 line-through text-xl">${billingCycle === "yearly" ? "1440" : "120"}</span>
                  <span className="text-3xl font-bold text-white">${billingCycle === "yearly" ? "1152" : "120"}</span>
                </div>
                <CardDescription className="text-center text-gray-300">
                  {billingCycle === "yearly" ? "per year (save $288!)" : "per month"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Everything in Pro Plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">1440 input videos (per year)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-200">Max 20 Minutes Timeframe</span>
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Unlimited social account connections</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Search in analysis tools</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Downloader - 1080P/4K</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Downloader - MP3</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">YouTube Transcript</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Clipper Analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Creator Analysis</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-teal-400 hover:bg-teal-500 text-black font-medium">Upgrade to BUSINESS</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}