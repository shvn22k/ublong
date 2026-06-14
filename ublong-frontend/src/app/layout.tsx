import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body-family",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UBlong | AI-Powered Civil Registration & Legal Identity Platform",
  description:
    "Helping refugee, migrant, and stateless families secure official birth registration and legal document packages for children with state-of-the-art AI legal navigation.",
  keywords: [
    "Humanitarian AI",
    "Stateless children",
    "Birth certificate assistance",
    "Refugee identity documents",
    "Legal navigation AI",
    "UNICEF",
    "Civil registration",
  ],
  authors: [{ name: "UBlong Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${plusJakartaSans.variable} antialiased selection:bg-teal-500 selection:text-white transition-colors duration-300`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
