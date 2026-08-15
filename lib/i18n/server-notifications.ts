import {dictionaryFor,type TranslationKey} from "./dictionary";
import {normalizeLocale} from "./locales";
import type {NotificationEventType} from "../notifications/preferences";

const copyKeys:Record<NotificationEventType,{title:TranslationKey;text:TranslationKey;button:TranslationKey}>={
  private_message:{title:"notifications.newMessage",text:"notifications.newMessage",button:"home.message"},
  meet_chat_message:{title:"notifications.newMessage",text:"notifications.newMessage",button:"meet.openChat"},
  meet_request_new:{title:"notifications.newRequest",text:"notifications.newRequestText",button:"meet.openChat"},
  meet_request_approved:{title:"notifications.requestAccepted",text:"notifications.chatAvailable",button:"meet.openChat"},
  meet_request_rejected:{title:"notifications.requestRejected",text:"notifications.requestRejectedText",button:"meet.profile"},
  meet_participant_joined:{title:"notifications.participantJoined",text:"notifications.participantJoinedText",button:"meet.profile"},
  meet_participant_left:{title:"notifications.participantLeft",text:"notifications.participantLeftText",button:"meet.profile"},
  meet_updated:{title:"notifications.meetChanged",text:"notifications.newTime",button:"meet.profile"},
  meet_cancelled:{title:"notifications.meetCancelled",text:"notifications.meetCancelledText",button:"navigation.meet"},
  meet_reminder:{title:"notifications.meetSoon",text:"notifications.meetSoonText",button:"meet.profile"},
  like_received:{title:"notifications.newLike",text:"notifications.newLikeText",button:"likes.title"},
  match_created:{title:"notifications.newMatch",text:"notifications.newMatchText",button:"home.message"},
  system:{title:"notificationSettings.news",text:"notificationSettings.newsHint",button:"common.continue"},
};

export function recipientPushCopy(type:NotificationEventType,language?:string|null){
  const dictionary=dictionaryFor(normalizeLocale(language));const keys=copyKeys[type];
  return {title:dictionary[keys.title],text:type==="private_message"||type==="meet_chat_message"?undefined:dictionary[keys.text],button:dictionary[keys.button]};
}
