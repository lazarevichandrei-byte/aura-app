export type TextDirection = "ltr" | "rtl";

export interface SupportedLocale {
  code:string;
  name:string;
  nativeName:string;
  flag:string;
  direction:TextDirection;
  intlLocale:string;
}

export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES:SupportedLocale[] = [
  ["ru","Russian","Русский","🇷🇺","ltr","ru-RU"], ["en","English","English","🇬🇧","ltr","en-US"],
  ["be","Belarusian","Беларуская","🇧🇾","ltr","be-BY"], ["uk","Ukrainian","Українська","🇺🇦","ltr","uk-UA"],
  ["pl","Polish","Polski","🇵🇱","ltr","pl-PL"], ["de","German","Deutsch","🇩🇪","ltr","de-DE"],
  ["fr","French","Français","🇫🇷","ltr","fr-FR"], ["es","Spanish","Español","🇪🇸","ltr","es-ES"],
  ["it","Italian","Italiano","🇮🇹","ltr","it-IT"], ["pt","Portuguese","Português","🇵🇹","ltr","pt-PT"],
  ["nl","Dutch","Nederlands","🇳🇱","ltr","nl-NL"], ["cs","Czech","Čeština","🇨🇿","ltr","cs-CZ"],
  ["sk","Slovak","Slovenčina","🇸🇰","ltr","sk-SK"], ["hu","Hungarian","Magyar","🇭🇺","ltr","hu-HU"],
  ["ro","Romanian","Română","🇷🇴","ltr","ro-RO"], ["bg","Bulgarian","Български","🇧🇬","ltr","bg-BG"],
  ["el","Greek","Ελληνικά","🇬🇷","ltr","el-GR"], ["sr","Serbian","Srpski","🇷🇸","ltr","sr-RS"],
  ["hr","Croatian","Hrvatski","🇭🇷","ltr","hr-HR"], ["sl","Slovenian","Slovenščina","🇸🇮","ltr","sl-SI"],
  ["lt","Lithuanian","Lietuvių","🇱🇹","ltr","lt-LT"], ["lv","Latvian","Latviešu","🇱🇻","ltr","lv-LV"],
  ["et","Estonian","Eesti","🇪🇪","ltr","et-EE"], ["sv","Swedish","Svenska","🇸🇪","ltr","sv-SE"],
  ["no","Norwegian","Norsk","🇳🇴","ltr","nb-NO"], ["da","Danish","Dansk","🇩🇰","ltr","da-DK"],
  ["fi","Finnish","Suomi","🇫🇮","ltr","fi-FI"], ["tr","Turkish","Türkçe","🇹🇷","ltr","tr-TR"],
  ["ar","Arabic","العربية","🇸🇦","rtl","ar-SA"], ["he","Hebrew","עברית","🇮🇱","rtl","he-IL"],
  ["fa","Persian","فارسی","🇮🇷","rtl","fa-IR"], ["hi","Hindi","हिन्दी","🇮🇳","ltr","hi-IN"],
  ["id","Indonesian","Bahasa Indonesia","🇮🇩","ltr","id-ID"], ["ms","Malay","Bahasa Melayu","🇲🇾","ltr","ms-MY"],
  ["ko","Korean","한국어","🇰🇷","ltr","ko-KR"], ["ja","Japanese","日本語","🇯🇵","ltr","ja-JP"],
  ["zh-CN","Chinese (Simplified)","简体中文","🇨🇳","ltr","zh-CN"], ["zh-TW","Chinese (Traditional)","繁體中文","🇹🇼","ltr","zh-TW"],
  ["vi","Vietnamese","Tiếng Việt","🇻🇳","ltr","vi-VN"], ["th","Thai","ไทย","🇹🇭","ltr","th-TH"],
].map(([code,name,nativeName,flag,direction,intlLocale])=>({code,name,nativeName,flag,direction:direction as TextDirection,intlLocale}));

export const LOCALE_BY_CODE = new Map(SUPPORTED_LOCALES.map((locale)=>[locale.code,locale]));

function supportedLocale(input?:string|null):string|null{
  if(!input||typeof input!=="string")return null;
  const normalized = input.replace("_","-");
  const lower = normalized.toLowerCase();
  if(lower === "zh-hans" || lower === "zh-cn" || lower === "zh-sg") return "zh-CN";
  if(lower === "zh-hant" || lower === "zh-tw" || lower === "zh-hk" || lower === "zh-mo") return "zh-TW";
  const exact = SUPPORTED_LOCALES.find((locale)=>locale.code.toLowerCase()===lower);
  if(exact) return exact.code;
  const base = lower.split("-")[0];
  return SUPPORTED_LOCALES.find((locale)=>locale.code.toLowerCase()===base)?.code||null;
}

export function resolveSupportedLocale(...candidates:(string|null|undefined)[]):string{
  for(const candidate of candidates){const locale=supportedLocale(candidate);if(locale)return locale;}
  return DEFAULT_LOCALE;
}

export function normalizeLocale(input?:string|null):string{return resolveSupportedLocale(input);}

export function localeBootstrapScript(){
  const supported=JSON.stringify(SUPPORTED_LOCALES.map(({code})=>code));
  return `(function(){try{var s=${supported},m=localStorage.getItem('aura-language-source')==='manual'||localStorage.getItem('aura-language-manual')==='1',v=m?localStorage.getItem('aura-language'):null,t=window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initDataUnsafe&&Telegram.WebApp.initDataUnsafe.user&&Telegram.WebApp.initDataUnsafe.user.language_code,b=(navigator.languages&&navigator.languages[0])||navigator.language||'en';if(!t){try{var q=new URLSearchParams(location.search).get('tgWebAppData')||new URLSearchParams(location.hash.replace(/^#/,'' )).get('tgWebAppData'),u=q&&new URLSearchParams(decodeURIComponent(q)).get('user');t=u&&JSON.parse(u).language_code}catch(e){}}function r(x){if(!x)return null;var n=String(x).replace('_','-'),l=n.toLowerCase();if(/^zh-(hans|cn|sg)/.test(l))return'zh-CN';if(/^zh-(hant|tw|hk|mo)/.test(l))return'zh-TW';for(var i=0;i<s.length;i++)if(s[i].toLowerCase()===l)return s[i];var a=l.split('-')[0];for(var j=0;j<s.length;j++)if(s[j].toLowerCase()===a)return s[j];return null}var z=r(v)||r(t)||r(b)||'en',d=/^(ar|he|fa)$/.test(z);document.documentElement.lang=z;document.documentElement.dir=d?'rtl':'ltr';window.__AURA_INITIAL_LOCALE__=z;window.__AURA_TELEGRAM_LOCALE__=t||null}catch(e){}})();`;
}
