import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AdminProvider } from "@/hooks/useAdmin";
import { Navbar } from "@/components/layout/Navbar";
import { AdminPinModal } from "@/components/ui/AdminPinModal";

export const metadata: Metadata = {
  title: "LifeVault - Personal Resource Hub & Student Dashboard",
  description:
    "Organized personal resource manager replacing chaotic messaging apps. Store study files, assignments, deadlines, timetables, links, and media in one visual dashboard.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <AdminProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Navbar />
            <main className="flex-1 pb-20 md:pb-12">{children}</main>
            <AdminPinModal />
          </div>
        </AdminProvider>
      </body>
    </html>
  );
}
