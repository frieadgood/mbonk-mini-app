import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopNavigation } from "@/components/top-navigation";
import { BottomNavigation } from "@/components/bottom-navigation";
import PrivyProvider from "@/components/privy-provider";
import { Toaster as SonnerToaster } from 'sonner';
import RecoilProvider from "@/components/recoil-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MemeCoin Trading App",
  description: "Trade meme coins on Telegram with the best UX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <script async src="https://telegram.org/js/telegram-web-app.js" />
        <script async defer src="/charting_library/charting_library.standalone.js" />
        {/* <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
        <script>eruda.init();</script> */}
      </head>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <PrivyProvider>
          <RecoilProvider>
            <div className="flex flex-col min-h-screen">
              <TopNavigation />
              <main className="flex-1 pb-15">{children}</main>
              <BottomNavigation />
            </div>
            <SonnerToaster position="top-center" theme="dark" duration={1500} />
          </RecoilProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
