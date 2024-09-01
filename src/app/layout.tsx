import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from "@/lib/session";
import { api } from "@/lib/api";
import Navbar from "./_components/navbar";
import LoadingScreen from "./_components/loading";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "maz3",
  description: "Maz3 is a DOM Element based game for completing a maze every day!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const RootLayout: React.FC<React.PropsWithChildren> = async ({ children }) => {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <SessionProvider>
        <body className="overflow-x-hidden">
          <Analytics />
          <Navbar />
          <LoadingScreen />
          {children}
        </body>
      </SessionProvider>
    </html>
  );
}

export default RootLayout;