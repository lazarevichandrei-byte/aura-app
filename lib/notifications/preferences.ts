export const NOTIFICATION_EVENT_TYPES=[
  "private_message","meet_chat_message","meet_request_new","meet_request_approved","meet_request_rejected",
  "meet_participant_joined","meet_participant_left","meet_updated","meet_cancelled","meet_reminder",
  "like_received","match_created","system",
] as const;
export type NotificationEventType=typeof NOTIFICATION_EVENT_TYPES[number];

export type NotificationPreferences={
  enabled:boolean;privateMessages:boolean;meetChatMessages:boolean;meetRequestNew:boolean;meetRequestApproved:boolean;
  meetRequestRejected:boolean;meetParticipantJoined:boolean;meetParticipantLeft:boolean;meetUpdated:boolean;
  meetCancelled:boolean;meetReminder:boolean;likes:boolean;matches:boolean;system:boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES:NotificationPreferences={
  enabled:true,privateMessages:true,meetChatMessages:true,meetRequestNew:true,meetRequestApproved:true,
  meetRequestRejected:true,meetParticipantJoined:true,meetParticipantLeft:false,meetUpdated:true,
  meetCancelled:true,meetReminder:true,likes:true,matches:true,system:true,
};

export const EVENT_PREFERENCE_KEY:Record<NotificationEventType,keyof NotificationPreferences>={
  private_message:"privateMessages",meet_chat_message:"meetChatMessages",meet_request_new:"meetRequestNew",
  meet_request_approved:"meetRequestApproved",meet_request_rejected:"meetRequestRejected",
  meet_participant_joined:"meetParticipantJoined",meet_participant_left:"meetParticipantLeft",meet_updated:"meetUpdated",
  meet_cancelled:"meetCancelled",meet_reminder:"meetReminder",like_received:"likes",match_created:"matches",system:"system",
};

export function normalizeNotificationPreferences(value:unknown,legacy?:{messages?:boolean;likes?:boolean;matches?:boolean;news?:boolean}):NotificationPreferences{
  const source=value&&typeof value==="object"?value as Record<string,unknown>:{};
  const defaults={...DEFAULT_NOTIFICATION_PREFERENCES,
    privateMessages:legacy?.messages??true,meetChatMessages:legacy?.messages??true,
    likes:legacy?.likes??true,matches:legacy?.matches??true,system:legacy?.news??true};
  return Object.fromEntries(Object.entries(defaults).map(([key,fallback])=>[key,typeof source[key]==="boolean"?source[key]:fallback])) as NotificationPreferences;
}

export function notificationEnabled(preferences:NotificationPreferences,eventType:NotificationEventType){
  return preferences.enabled&&preferences[EVENT_PREFERENCE_KEY[eventType]];
}

export const NOTIFICATION_PREFERENCE_KEYS=Object.keys(DEFAULT_NOTIFICATION_PREFERENCES) as (keyof NotificationPreferences)[];
