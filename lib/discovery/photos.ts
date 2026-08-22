export const PROFILE_PLACEHOLDER="/aura-profile-placeholder.svg";

export function validPhotoUrls(value:unknown){
  return Array.isArray(value)
    ? value.filter((photo):photo is string=>typeof photo==="string"&&photo.trim().length>0)
    : [];
}

export function resolveProfilePhoto(profile:unknown){
  if(!profile||typeof profile!=="object")return PROFILE_PLACEHOLDER;
  const candidate=profile as {photos?:unknown;main_photo_index?:unknown;avatar_url?:unknown};
  const photos=validPhotoUrls(candidate.photos);
  const mainIndex=typeof candidate.main_photo_index==="number"&&candidate.main_photo_index>=0&&candidate.main_photo_index<photos.length?candidate.main_photo_index:0;
  if(photos[mainIndex])return photos[mainIndex];
  if(typeof candidate.avatar_url==="string"&&candidate.avatar_url.trim())return candidate.avatar_url;
  return PROFILE_PLACEHOLDER;
}
