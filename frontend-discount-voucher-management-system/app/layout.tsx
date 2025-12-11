import '../styles/globals.css'
import React from 'react'
import { Toast } from '../components/Toast'

export const metadata = {
  title: 'Voucher App',
  description: 'Voucher Management UI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray/5 text-gray/90">
        <div className="max-w-4xl mx-auto p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Discount Voucher Management</h1>
          </header>
          <main>{children}</main>
           <Toast />
        </div>
      </body>
    </html>
  )
}
