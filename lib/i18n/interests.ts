import type { TranslationKey } from "./dictionary";

export const INTERESTS = [
  {id:"travel",legacy:"Путешествия"},{id:"music",legacy:"Музыка"},{id:"sport",legacy:"Спорт"},{id:"cinema",legacy:"Кино"},
  {id:"games",legacy:"Игры"},{id:"business",legacy:"Бизнес"},{id:"food",legacy:"Еда"},{id:"yoga",legacy:"Йога"},
  {id:"cars",legacy:"Авто"},{id:"books",legacy:"Книги"},{id:"technology",legacy:"Технологии"},{id:"art",legacy:"Искусство"},
  {id:"dance",legacy:"Танцы"},{id:"nature",legacy:"Природа"},
] as const;

const ID_BY_VALUE=new Map<string,string>();
for(const interest of INTERESTS){ID_BY_VALUE.set(interest.id,interest.id);ID_BY_VALUE.set(interest.legacy,interest.id);}

export function interestLabel(value:string,t:(key:TranslationKey)=>string){
  const id=ID_BY_VALUE.get(value);
  return id?t(`interests.${id}` as TranslationKey):value;
}

export function interestId(value:string){return ID_BY_VALUE.get(value)??value;}
