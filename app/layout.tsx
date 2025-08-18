import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
})

export const metadata: Metadata = {
  title: "SHEIN Finance Extractor - Calculadora de Lucros",
  description: "Ferramenta moderna para processar e analisar planilhas de pedidos da SHEIN com cálculos automáticos de lucro e métricas financeiras",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen`}>
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke-width=%271%27 stroke=%27%23e2e8f0%27%3e%3cpath d=%27m0 2 2-2M0 14l14-14M0 26l26-26M0 30l30-30M2 32l30-30M14 32l18-18M26 32l6-6%27/%3e%3c/svg%3e')] opacity-50"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
