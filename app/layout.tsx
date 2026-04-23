import { Sora } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({ children }: any) {
  return (
    <html lang="ru">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={sora.className}>{children}</body>
    </html>
  );
}