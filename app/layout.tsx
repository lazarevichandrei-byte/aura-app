import "./globals.css";

export default function RootLayout({ children }: any) {
  return (
    <html lang="ru">
      <body className="bg-[#0B0B0F] text-white">
        {children}
      </body>
    </html>
  );
}