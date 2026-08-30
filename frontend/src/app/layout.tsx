import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import LayoutInner from "@/components/LayoutInner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Restock Dashboard",
  description: "Manage inventory, rescue offers, and customers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text overflow-hidden`}>
        <AuthProvider>
          <LayoutInner>{children}</LayoutInner>
        </AuthProvider>
      </body>
    </html>
  );
}
