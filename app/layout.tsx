import './globals.css'
import { ReactNode } from 'react'
import React, { Suspense } from 'react';
import Loading from '@/components/loading';

export const metadata = {
  title: 'Blog Website',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className='bg-gray-100 dark:bg-gray-900'>
        <Suspense fallback={<Loading />}>
          <main className="mx-auto">{children}</main>
        </Suspense>
      </body>
    </html>
  )
}
