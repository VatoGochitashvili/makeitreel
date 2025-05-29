
'use client'

import { Poppins } from "next/font/google"

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500"],
  subsets: ["latin"],
  variable: '--font-poppins',
  display: 'swap',
})

export function FontProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className={poppins.variable} suppressHydrationWarning>
      {children}
    </div>
  )
}
