import {DICTIONARIES,en} from "./dictionary";
import {SUPPORTED_LOCALES} from "./locales";

export type DictionaryValidationResult={locale:string;totalKeys:number;missing:string[];extra:string[];sameAsEnglish:string[];sameAsEnglishPercentage:number;suspiciousSameAsEnglish:string[];coreSuspiciousSameAsEnglish:string[]};

const ALLOWED_IDENTICAL_VALUES=new Set(["Aura","Telegram","Wi-Fi","email","Spam","Sport","Yoga","Chat","Chats","Support","Bug","Idea","Name","Notifications","Actions","Date","Message","Message…","Messages","Participants","{count} participants","30 minutes","{count} km","{distance} km","System","Online","Privacy","Send","Bar","Hookah","Cinema","Restaurant","Bowling","Karaoke","Concert","Picnic","Nature","Coworking","Shopping","Dating","Business","Art"]);
const CORE_PREFIXES=["common.","navigation.","settings.","account.","profile.","chat.","chats.","meet."];
export const CORE_UI_KEYS=Object.keys(en).filter((key)=>CORE_PREFIXES.some((prefix)=>key.startsWith(prefix)));

export function validateDictionaries():DictionaryValidationResult[]{
  const expected=new Set(Object.keys(en));
  return SUPPORTED_LOCALES.map(({code})=>{
    const dictionary=DICTIONARIES[code];
    const actual=new Set(Object.keys(dictionary || {}));
    const sameAsEnglish=code==="en"?[]:[...expected].filter((key)=>dictionary?.[key as keyof typeof en]===en[key as keyof typeof en]);
    const suspiciousSameAsEnglish=sameAsEnglish.filter((key)=>!ALLOWED_IDENTICAL_VALUES.has(en[key as keyof typeof en]));
    return {
      locale:code,
      totalKeys:expected.size,
      missing:[...expected].filter((key)=>!actual.has(key)),
      extra:[...actual].filter((key)=>!expected.has(key)),
      sameAsEnglish,
      sameAsEnglishPercentage:expected.size?Number(((sameAsEnglish.length/expected.size)*100).toFixed(2)):0,
      suspiciousSameAsEnglish,
      coreSuspiciousSameAsEnglish:suspiciousSameAsEnglish.filter((key)=>CORE_UI_KEYS.includes(key)),
    };
  });
}

export function assertDictionariesComplete(){
  const invalid=validateDictionaries().filter(({missing,extra})=>missing.length || extra.length);
  if(invalid.length) throw new Error(`Invalid i18n dictionaries: ${JSON.stringify(invalid)}`);
  return true;
}

export function dictionaryAudit(){
  return validateDictionaries();
}

const SMOKE_KEYS=["navigation.home","settings.title","settings.appearance","settings.notifications","account.edit","account.privacy","account.support","profile.location","profile.interests","common.save"] as const;
export function localeSwitchSmoke(locales=["ru","en","uk","be","de","pl","fr","es","pt","ar","ja","zh-CN"]){
  return locales.map((locale)=>({locale,values:Object.fromEntries(SMOKE_KEYS.map((key)=>[key,dictionaryForSafe(locale,key)])),missing:SMOKE_KEYS.filter((key)=>!DICTIONARIES[locale]?.[key])}));
}
function dictionaryForSafe(locale:string,key:keyof typeof en){return DICTIONARIES[locale]?.[key]??en[key];}
