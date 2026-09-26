import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AdminProvider } from "@/hooks/useAdmin";
import { PwaProvider } from "@/components/providers/PwaProvider";
import { Navbar } from "@/components/layout/Navbar";
import { PwaInstallPrompt } from "@/components/ui/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "LifeVault - Personal Resource Hub & Student Dashboard",
  description:
    "Organized personal resource manager replacing chaotic messaging apps. Store study files, assignments, deadlines, timetables, links, and media in one private visual dashboard.",
  manifest: "/manifest.webmanifest",
  applicationName: "LifeVault",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeVault",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <AdminProvider>
            <PwaProvider>
              <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
                <Navbar />
                <main className="flex-1 pb-20 md:pb-12">{children}</main>
              </div>
              <PwaInstallPrompt />
            </PwaProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
