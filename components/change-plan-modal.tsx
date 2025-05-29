"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Check, Info, Crown } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface ChangePlanModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePlanModal({ isOpen, onClose }: ChangePlanModalProps) {
  const { user } = useAuth()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")
  const [mounted, setMounted] = useState(false)

  const currentPlan = user?.subscription?.plan || "basic"

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handlePlanChange = (targetPlan: string) => {
    if (targetPlan === currentPlan) return
    
    const action = getPlanAction(currentPlan, targetPlan)
    alert(`${action} to ${targetPlan.toUpperCase()} plan initiated! This would redirect to payment processing.`)
    onClose()
  }

  const getPlanAction = (current: string, target: string) => {
    const planHierarchy = { basic: 0, pro: 1, expert: 2, business: 3 }
    const currentLevel = planHierarchy[current as keyof typeof planHierarchy] || 0
    const targetLevel = planHierarchy[target as keyof typeof planHierarchy] || 1
    
    return targetLevel > currentLevel ? "Upgrade" : "Downgrade"
  }

  const getButtonText = (planType: string) => {
    if (planType === currentPlan) return "Current Plan"
    
    const action = getPlanAction(currentPlan, planType)
    if (action === "Downgrade") {
      return `Downgrade to ${planType.toUpperCase()}`
    }
    return `Upgrade to ${planType.toUpperCase()}`
  }

  const isCurrentPlan = (planType: string) => planType === currentPlan

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
          <h2 className="text-2xl font-medium text-white">Change Your Plan</h2>
          <p className="text-gray-300 mt-2">
            {currentPlan === "basic" 
              ? "Choose a plan to unlock AI video generation and premium features" 
              : `Currently on ${currentPlan.toUpperCase()} plan - upgrade or downgrade as needed`
            }
          </p>

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

          {/* Show message for unsubscribed users */}
          {currentPlan === "basic" && (
            <div className="mb-6 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Info className="h-4 w-4" />
                <span className="font-medium">Upgrade Required</span>
              </div>
              <p className="text-sm text-amber-200">
                You need to upgrade to Pro or higher to generate videos and access premium features.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {/* PRO Plan */}
            <Card 
              className={`bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${
                isCurrentPlan("pro") 
                  ? "border-teal-400 shadow-lg ring-2 ring-teal-400/50" 
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              {isCurrentPlan("pro") && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-teal-400 text-black font-bold">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="pb-4 relative">
                <div className="bg-teal-400/20 text-teal-400 py-1 px-3 rounded-full text-xs font-medium w-fit mx-auto mb-2">
                  PRO
                </div>
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
                    <span className="text-sm text-gray-200">Max 10 Minutes Timeframe</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">No watermark</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Auto features suite</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">1 social account connection</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${
                    isCurrentPlan("pro") 
                      ? "bg-teal-400 text-black cursor-default" 
                      : "bg-teal-400 hover:bg-teal-500 text-black"
                  }`}
                  disabled={isCurrentPlan("pro")}
                  onClick={() => !isCurrentPlan("pro") && handlePlanChange("pro")}
                >
                  {getButtonText("pro")}
                </Button>
              </CardFooter>
            </Card>

            {/* EXPERT Plan */}
            <Card 
              className={`bg-gray-800/50 backdrop-blur-sm relative overflow-hidden transition-all duration-200 ${
                isCurrentPlan("expert") 
                  ? "border-yellow-400 shadow-lg ring-2 ring-yellow-400/50" 
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              {isCurrentPlan("expert") && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="pb-4 relative">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-yellow-400/20 text-yellow-400 py-1 px-3 rounded-full text-xs font-medium flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    EXPERT
                  </div>
                </div>
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
                    <Check className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Everything in Pro Plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">720 input videos (per year)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Max 20 Minutes Timeframe</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">3 social account connections</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Advanced AI features</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${
                    isCurrentPlan("expert") 
                      ? "bg-yellow-400 text-black cursor-default" 
                      : "bg-yellow-400 hover:bg-yellow-500 text-black"
                  }`}
                  disabled={isCurrentPlan("expert")}
                  onClick={() => !isCurrentPlan("expert") && handlePlanChange("expert")}
                >
                  {getButtonText("expert")}
                </Button>
              </CardFooter>
            </Card>

            {/* BUSINESS Plan */}
            <Card 
              className={`bg-gray-800/50 backdrop-blur-sm transition-all duration-200 ${
                isCurrentPlan("business") 
                  ? "border-blue-400 shadow-lg ring-2 ring-blue-400/50" 
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              {isCurrentPlan("business") && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-400 text-black font-bold">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="pb-4 relative">
                <div className="bg-blue-400/20 text-blue-400 py-1 px-3 rounded-full text-xs font-medium w-fit mx-auto mb-2">
                  BUSINESS
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-gray-400 line-through text-xl">${billingCycle === "yearly" ? "1200" : "100"}</span>
                  <span className="text-3xl font-bold text-white">${billingCycle === "yearly" ? "960" : "100"}</span>
                </div>
                <CardDescription className="text-center text-gray-300">
                  {billingCycle === "yearly" ? "per year (save $240!)" : "per month"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Everything in Expert Plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Unlimited input videos</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Max 60 Minutes Timeframe</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">10 social account connections</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-200">Priority support & API access</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${
                    isCurrentPlan("business") 
                      ? "bg-blue-400 text-black cursor-default" 
                      : "bg-blue-400 hover:bg-blue-500 text-black"
                  }`}
                  disabled={isCurrentPlan("business")}
                  onClick={() => !isCurrentPlan("business") && handlePlanChange("business")}
                >
                  {getButtonText("business")}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {currentPlan !== "basic" && (
            <div className="mt-6 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Info className="h-4 w-4" />
                <span className="font-medium">Plan Change Information</span>
              </div>
              <p className="text-sm text-amber-200">
                {currentPlan === "business" && "You can downgrade to Expert or Pro plan. Changes will take effect at your next billing cycle."}
                {currentPlan === "expert" && "You can upgrade to Business or downgrade to Pro. Changes will take effect at your next billing cycle."}
                {currentPlan === "pro" && "You can upgrade to Expert or Business. Changes will take effect at your next billing cycle."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
