import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

import Script from "next/script";
import Providers from "./providers";
import {localeBootstrapScript} from "../lib/i18n/locales";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <style>{`@keyframes auraI18nReveal{to{visibility:visible}}html:not([data-aura-i18n-ready]) body{visibility:hidden;animation:auraI18nReveal 0s 2s forwards}`}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('aura-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})();`,
          }}
        />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: localeBootstrapScript(),
          }}
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
