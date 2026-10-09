import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { MobileNavProvider } from "@/context/MobileNavContext";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "TaskFlow — Project & Task Management",
  description: "Modern project and task management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} font-sans h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#F8FAFC] text-slate-800 flex flex-col"
      >
        <AuthProvider>
          <MobileNavProvider>{children}</MobileNavProvider>
        </AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
