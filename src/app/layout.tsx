import type { Metadata } from "next";
import "./globals.css";
import { EnvProvider } from "../components/_context/envContext";
import { publicEnvStore } from "../lib/env";

export const metadata: Metadata = {
  title: "Next.js Sample App",
  description: "A Next.js application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="bg-neutral-100 min-h-screen">
          {/* クライアントで環境ごと切り替える値をコンテキストに持たせる。 */}
          <EnvProvider envStore={publicEnvStore}>{children}</EnvProvider>
        </div>
      </body>
    </html>
  );
}
