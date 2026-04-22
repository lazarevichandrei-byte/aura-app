import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({ children }: any) {
  return (
    <html lang="ru">
      <body className={sora.className}>
        {children}
      </body>
    </html>
  );
}