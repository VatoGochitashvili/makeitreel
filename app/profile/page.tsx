"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, User, CreditCard, Settings, Bell, Shield, Calendar, Download, Plus, Edit, Trash2, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ChangePlanModal from "@/components/change-plan-modal"

interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "bank"
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [company, setCompany] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true
    }
  ])

  // Notification preferences
  const [notifications, setNotifications] = useState({
    videoProcessing: true,
    weeklyReport: true,
    billing: true,
    productUpdates: false,
    marketing: false
  })

  // New payment method form
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    name: "",
    type: "card" as "card" | "paypal" | "bank"
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  if (!mounted || !user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSaveProfile = () => {
    // Mock save functionality
    console.log("Saving profile:", { name, email, company })
    alert("Profile updated successfully!")
  }

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long!")
      return
    }
    // Mock password update
    console.log("Updating password")
    alert("Password updated successfully!")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: newPaymentMethod.type,
      last4: newPaymentMethod.cardNumber.slice(-4),
      brand: "Visa", // Mock brand detection
      expiryMonth: parseInt(newPaymentMethod.expiryMonth),
      expiryYear: parseInt(newPaymentMethod.expiryYear),
      isDefault: paymentMethods.length === 0
    }

    setPaymentMethods([...paymentMethods, newMethod])
    setShowAddPaymentDialog(false)
    setNewPaymentMethod({
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      name: "",
      type: "card"
    })
    alert("Payment method added successfully!")
  }

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
    alert("Default payment method updated!")
  }

  const handleDeletePaymentMethod = (id: string) => {
    if (paymentMethods.find(m => m.id === id)?.isDefault) {
      alert("Cannot delete default payment method. Please set another as default first.")
      return
    }
    setPaymentMethods(methods => methods.filter(method => method.id !== id))
    alert("Payment method removed!")
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // Mock invoice download
    console.log("Downloading invoice:", invoiceId)
    alert("Invoice download started!")
  }

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Edit payment method function
  const handleEditPaymentMethod = (id: string) => {
    const method = paymentMethods.find(m => m.id === id)
    if (method) {
      setNewPaymentMethod({
        cardNumber: `****${method.last4}`,
        expiryMonth: method.expiryMonth?.toString() || "",
        expiryYear: method.expiryYear?.toString() || "",
        cvv: "***",
        name: "Cardholder Name",
        type: method.type
      })
      setShowAddPaymentDialog(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200">
      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-medium text-white mb-8">Profile Settings</h1>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Personal Information</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-gray-700/50 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700/50 border-gray-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company name"
                    className="bg-gray-700/50 border-gray-600"
                  />
                </div>
                <Button onClick={handleSaveProfile} className="bg-teal-600 hover:bg-teal-500">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  Active Subscription
                  {user?.subscription && (
                      <Badge className={
                        user.subscription.plan === "expert" && user.email === "asa@asa.com" 
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold border border-yellow-300 shadow-lg" 
                          : "bg-emerald-600 text-white font-medium"
                      }>
                        {user.subscription.plan === "expert" && user.email === "asa@asa.com" ? "Expert Mode" : user.subscription.plan.toUpperCase()}
                      </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    {user?.subscription && user.subscription.plan === "expert" && user.email === "asa@asa.com" ? 
                      "Expert Mode - Active with premium AI features and unlimited access" : 
                      user?.subscription ? 
                        `Your ${user.subscription.plan.toUpperCase()} plan is active and includes premium AI features` : 
                        "You don't have an active subscription"
                    }
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.subscription ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-400">Plan</Label>
                        <div className="text-lg font-medium text-white capitalize">
                          {user.subscription.plan === "expert" && user.email === "asa@asa.com" ? "Expert Mode" : user.subscription.plan}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-400">Status</Label>
                        <div className="text-lg font-medium text-green-400 capitalize">
                          {user.subscription.status}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-400">Billing Cycle</Label>
                        <div className="text-lg font-medium text-white capitalize">
                          {user.subscription.billingCycle}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-400">Next Billing Date</Label>
                        <div className="text-lg font-medium text-white">
                          {formatDate(user.subscription.expiresAt)}
                        </div>
                      </div>
                    </div>
                    <Separator className="bg-gray-700" />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="border-gray-600 hover:bg-gray-700"
                        onClick={() => setShowChangePlanModal(true)}
                      >
                        Change Plan
                      </Button>
                      <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                        Cancel Subscription
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-2">Basic Account</h3>
                      <p className="text-gray-400 mb-4">Upgrade to unlock AI video generation and premium features</p>

                      <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Current Limitations:</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li>• No AI video generation</li>
                          <li>• No premium templates</li>
                          <li>• No advanced features</li>
                        </ul>
                      </div>
                    </div>

                    <Button className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2">
                      🚀 Upgrade to Pro
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Usage Statistics</CardTitle>
                <CardDescription>
                  {user?.subscription?.plan === "expert" ? "Your Expert plan usage overview" : "Your monthly usage overview"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-400">
                      {user?.subscription?.plan === "expert" ? "47" : "15"}
                    </div>
                    <div className="text-sm text-gray-400">Videos Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-400">
                      {user?.subscription?.plan === "expert" ? "1393" : "345"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {user?.subscription?.plan === "expert" ? "Videos Remaining (Annual)" : "Videos Remaining"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-400">
                      {user?.subscription?.plan === "expert" ? "338" : "23"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {user?.subscription?.plan === "expert" ? "Days Until Annual Reset" : "Days Until Reset"}
                    </div>
                  </div>
                </div>
                {user?.subscription?.plan === "expert" && user.email === "expert@example.com" && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30 rounded-lg">
                    <div className="text-sm text-yellow-400 font-bold">Expert Mode Benefits Active</div>
                    <div className="text-xs text-gray-300 mt-1">
                      1440 videos per year • 20-minute max duration • Advanced AI features • Priority support
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expert Features Section */}
            {user?.subscription?.plan === "expert" && user.email === "expert@example.com" && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-yellow-400" />
                    Expert Mode Features
                  </CardTitle>
                  <CardDescription>Premium features included in your Expert Mode subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-200">1440 input videos (per year)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-200">Max 20 Minutes Timeframe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-200">Unlimited social account connections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-200">Search in analysis tools</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-200">Advanced AI features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-200">Priority support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-gray-600 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-gray-400" />
                      <div>
                        <div className="text-white">•••• •••• •••• {method.last4}</div>
                        <div className="text-sm text-gray-400">
                          {method.brand} • Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400">Default</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-600 hover:bg-gray-700"
                        onClick={() => handleEditPaymentMethod(method.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!method.isDefault && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-600 hover:bg-gray-700"
                            onClick={() => handleSetDefaultPayment(method.id)}
                          >
                            Set Default
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Payment Method</DialogTitle>
                      <DialogDescription>Add a new payment method to your account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <Select 
                          value={newPaymentMethod.type} 
                          onValueChange={(value: "card" | "paypal" | "bank") => 
                            setNewPaymentMethod(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="bank">Bank Account</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newPaymentMethod.type === "card" && (
                        <>
                          <div className="space-y-2">
                            <Label>Card Number</Label>
                            <Input
                              value={newPaymentMethod.cardNumber}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                              placeholder="1234 5678 9012 3456"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Expiry Month</Label>
                              <Input
                                value={newPaymentMethod.expiryMonth}
                                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                                placeholder="12"
                                className="bg-gray-700/50 border-gray-600"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Expiry Year</Label>
                              <Input
                                value={newPaymentMethod.expiryYear}
                                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                                placeholder="2026"
                                className="bg-gray-700/50 border-gray-600"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>CVV</Label>
                              <Input
                                value={newPaymentMethod.cvv}
                                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                                placeholder="123"
                                className="bg-gray-700/50 border-gray-600"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label>Cardholder Name</Label>
                        <Input
                          value={newPaymentMethod.name}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>

                      <Button onClick={handleAddPaymentMethod} className="w-full bg-teal-600 hover:bg-teal-500">
                        Add Payment Method
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Billing History</CardTitle>
                <CardDescription>Download your invoices and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: "inv_2025_01", date: "Jan 1, 2025", amount: "$576.00", status: "Paid" },
                    { id: "inv_2024_01", date: "Jan 1, 2024", amount: "$576.00", status: "Paid" },
                    { id: "inv_2023_01", date: "Jan 1, 2023", amount: "$480.00", status: "Paid" }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                      <div>
                        <div className="text-white">{invoice.date}</div>
                        <div className="text-sm text-gray-400">Expert Plan - Yearly</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-white">{invoice.amount}</div>
                          <div className="text-sm text-green-400">{invoice.status}</div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Email Notifications</CardTitle>
                <CardDescription>Choose what email notifications you'd like to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { 
                    key: 'videoProcessing' as keyof typeof notifications, 
                    label: "Video processing completed", 
                    desc: "Get notified when your AI shorts are ready" 
                  },
                  { 
                    key: 'weeklyReport' as keyof typeof notifications, 
                    label: "Weekly usage report", 
                    desc: "Receive a summary of your weekly activity" 
                  },
                  { 
                    key: 'billing' as keyof typeof notifications, 
                    label: "Billing notifications", 
                    desc: "Get notified about payments and renewals" 
                  },
                  { 
                    key: 'productUpdates' as keyof typeof notifications, 
                    label: "Product updates", 
                    desc: "Be the first to know about new features" 
                  },
                  { 
                    key: 'marketing' as keyof typeof notifications, 
                    label: "Marketing emails", 
                    desc: "Receive tips and tutorials" 
                  }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-white">{item.label}</div>
                      <div className="text-sm text-gray-400">{item.desc}</div>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Password & Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-gray-700/50 border-gray-600" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-700/50 border-gray-600" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-700/50 border-gray-600" 
                  />
                </div>
                <Button onClick={handleUpdatePassword} className="bg-teal-600 hover:bg-teal-500">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white">2FA Status</div>
                    <div className="text-sm text-gray-400">
                      Two-factor authentication is currently {twoFactorEnabled ? "enabled" : "disabled"}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-gray-600 hover:bg-gray-700"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled)
                      alert(`2FA ${!twoFactorEnabled ? "enabled" : "disabled"} successfully!`)
                    }}
                  >
                    {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Plan Modal */}
      <ChangePlanModal 
        isOpen={showChangePlanModal} 
        onClose={() => setShowChangePlanModal(false)} 
      />
    </div>
  )
}