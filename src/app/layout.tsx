import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GiiKER Tic-Tac-Toe Online",
  description:
    "Play Infinite Tic-Tac-Toe online with friends. Experience the revolutionary game mode where pieces disappear after placing 3, making every move strategic.",
  keywords: [
    "tic-tac-toe",
    "online game",
    "multiplayer",
    "infinite tic-tac-toe",
    "giiker",
    "strategy game",
  ],
  authors: [{ name: "GiiKER Tic-Tac-Toe Team" }],
  metadataBase: new URL("http://localhost:3000"),
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    title: "GiiKER Tic-Tac-Toe Online",
    description: "Play Infinite Tic-Tac-Toe online with friends",
    siteName: "GiiKER Tic-Tac-Toe",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GiiKER Tic-Tac-Toe Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GiiKER Tic-Tac-Toe Online",
    description: "Play Infinite Tic-Tac-Toe online with friends",
    images: ["/og-image.png"],
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    ],
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SocketProvider>
              <ToastProvider>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                  {children}
                </div>
              </ToastProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
