import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

import Script from "next/script";
import Providers from "./providers";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('aura-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('aura-language')||(navigator.language||'en');l=l.replace('_','-');var b=l.toLowerCase();if(/^zh-(hant|tw|hk|mo)/.test(b))l='zh-TW';else if(/^zh/.test(b))l='zh-CN';else l=b.split('-')[0];var rtl=/^(ar|he|fa)$/.test(l);document.documentElement.lang=l;document.documentElement.dir=rtl?'rtl':'ltr'}catch(e){}})();`,
          }}
        />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>

      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
