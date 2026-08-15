import {DICTIONARIES,en} from "./dictionary";
import {SUPPORTED_LOCALES} from "./locales";

export type DictionaryValidationResult={locale:string;missing:string[];extra:string[]};

export function validateDictionaries():DictionaryValidationResult[]{
  const expected=new Set(Object.keys(en));
  return SUPPORTED_LOCALES.map(({code})=>{
    const dictionary=DICTIONARIES[code];
    const actual=new Set(Object.keys(dictionary || {}));
    return {
      locale:code,
      missing:[...expected].filter((key)=>!actual.has(key)),
      extra:[...actual].filter((key)=>!expected.has(key)),
    };
  });
}

export function assertDictionariesComplete(){
  const invalid=validateDictionaries().filter(({missing,extra})=>missing.length || extra.length);
  if(invalid.length) throw new Error(`Invalid i18n dictionaries: ${JSON.stringify(invalid)}`);
  return true;
}
