import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
})

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
})

export const metadata: Metadata = {
    title: "Hirezium - Modern Job Portal",
    description: "Find your dream job or hire top talent with Hirezium",
    icons: {
        icon: '/icon-transparent.png', // Using the provided icon as favicon
    }
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    )
}
