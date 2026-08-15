import {normalizeLocale} from "./locales";

type PushType="like"|"match"|"message";
type PushCopy={title:string;text?:string;button:string};

const english:Record<PushType,PushCopy>={
  like:{title:"❤️ New like",text:"Someone liked your profile.",button:"Open AURA"},
  match:{title:"💙 New match",text:"You can start chatting now.",button:"Open chat"},
  message:{title:"💬 New message",button:"Reply"},
};

const russian:Record<PushType,PushCopy>={
  like:{title:"❤️ Новый лайк",text:"Кому-то понравился ваш профиль.",button:"Открыть AURA"},
  match:{title:"💙 Новое совпадение",text:"Теперь можно начать общение.",button:"Открыть чат"},
  message:{title:"💬 Новое сообщение",button:"Ответить"},
};

export function recipientPushCopy(type:PushType,language?:string|null){
  return (normalizeLocale(language)==="ru" ? russian : english)[type];
}
