import {DEFAULT_NOTIFICATION_PREFERENCES,normalizeNotificationPreferences,type NotificationPreferences} from "../../notifications/preferences";
import {supabaseAdmin} from "../../supabase-admin";

export async function getUserNotificationPreferences(userId:string):Promise<NotificationPreferences>{
  const {data,error}=await supabaseAdmin.from("user_notification_preferences").select("preferences").eq("user_id",userId).maybeSingle();
  if(error)throw error;
  return normalizeNotificationPreferences(data?.preferences??DEFAULT_NOTIFICATION_PREFERENCES);
}

export async function getUsersNotificationPreferences(userIds:string[]):Promise<Map<string,NotificationPreferences>>{
  if(!userIds.length)return new Map();
  const {data,error}=await supabaseAdmin.from("user_notification_preferences").select("user_id,preferences").in("user_id",userIds);
  if(error)throw error;
  return new Map((data??[]).map((row)=>[row.user_id,normalizeNotificationPreferences(row.preferences)]));
}

export async function saveUserNotificationPreferences(userId:string,preferences:NotificationPreferences){
  return supabaseAdmin.from("user_notification_preferences").upsert({user_id:userId,preferences,updated_at:new Date().toISOString()},{onConflict:"user_id"});
}
