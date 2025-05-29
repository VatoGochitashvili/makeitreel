"use client"

import Link from "next/link"
import { Film, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AIBackground from "@/components/ai-background"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200 flex flex-col">
      {/* AI Digital Pattern Background */}
      <AIBackground />

      {/* Header */}
      <header className="py-8 px-8 relative z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Film className="h-10 w-10 text-teal-400" />
              <h1 className="text-3xl font-medium text-white tracking-tight">MakeItReel</h1>
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Signup
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-6 relative z-50">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gray-900/70 border-gray-800">
            <CardHeader>
              <CardTitle className="text-3xl font-medium text-center text-white">
                Terms & Conditions
              </CardTitle>
              <p className="text-center text-gray-400 mt-2">
                Last updated: January 15, 2025
              </p>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using MakeItReel ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
                <p>
                  MakeItReel is an AI-powered platform that helps users create short-form video content from YouTube videos. The service includes features such as automatic clipping, subtitle generation, and video optimization for social media platforms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h2>
                <p className="mb-2">By using our service, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Respect copyright laws and only use content you have rights to</li>
                  <li>Not use the service for illegal or harmful purposes</li>
                  <li>Provide accurate information when creating an account</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Not attempt to reverse engineer or copy our technology</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">4. Content and Copyright</h2>
                <p>
                  Users are responsible for ensuring they have the right to use any content they upload or process through our service. MakeItReel does not claim ownership of user-generated content but requires a license to provide our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">5. Privacy Policy</h2>
                <p>
                  Your privacy is important to us. We collect and use information as described in our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">6. Subscription and Billing</h2>
                <p className="mb-2">For paid subscription plans:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Subscriptions are billed in advance on a monthly or yearly basis</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>Refunds are provided according to our refund policy</li>
                  <li>We reserve the right to change pricing with advance notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
                <p>
                  MakeItReel shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">8. Service Availability</h2>
                <p>
                  We strive to maintain high service availability but do not guarantee uninterrupted access. Maintenance, updates, or technical issues may temporarily affect service availability.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
                <p>
                  We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through our service. Continued use after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">11. Contact Information</h2>
                <p>
                  For questions about these Terms & Conditions, please contact us at{" "}
                  <a href="mailto:support@makeitreel.com" className="text-teal-400 hover:underline">
                    support@makeitreel.com
                  </a>
                </p>
              </section>

              <div className="pt-6 border-t border-gray-700">
                <p className="text-center text-gray-400 text-sm">
                  By clicking "I accept the Terms & Conditions" during signup, you acknowledge that you have read, understood, and agree to be bound by these terms.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-800/30 relative z-50">
        <div className="container mx-auto text-center text-gray-500 text-sm font-light">
          {/* Removed "Built with AI" text */}
        </div>
      </footer>

      <div className="mt-8 border-t border-gray-800 pt-8">
        <div className="text-sm text-gray-400">
          <div>© {new Date().getFullYear()} MakeItReel. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
}
