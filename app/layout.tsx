import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import "@/styles/global.css"
import { Inter } from "next/font/google"
import Script from "next/script"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata = {
  title: "PayTrack - Client Payment Tracker",
  description: "Track client payments with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lang = "en"
  const dir = "ltr"
  return (
    <html lang={lang} dir={dir} className={inter.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
        <Script id="feeduser-widget" strategy="afterInteractive">
          {`
            window.Fu = window.Fu || {};
            Fu.access_token = "2a681a2ea1cc053b69ad7ba4201ad7";
            (function (d) {
              let s = d.createElement("script");
              s.async = true;
              s.src = "https://widget.feeduser.me/widget/v1.js";
              (d.head || d.body).appendChild(s);
            })(document);
          `}
        </Script>
      </body>
    </html>
  )
}
