import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OreO 啥都有 - 家庭库存管理',
  description: 'OreO的可爱家庭库存管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OreO 啥都有" />
        <link rel="apple-touch-icon" href="/oreohome.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/oreohome.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/oreohome.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/oreohome.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/oreohome.png" />
        <link rel="icon" type="image/png" href="/oreohome.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
