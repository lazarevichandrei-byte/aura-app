export type MeetLocation = {
  title: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
};

const SELECTED_LOCATION_KEY = "meet_location";
const INITIAL_LOCATION_KEY = "meet_location_initial";
const PROFILE_LOCATION_KEY = "profile_location";

export function readMeetLocation(key = SELECTED_LOCATION_KEY): MeetLocation | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!Number.isFinite(value.lat) || !Number.isFinite(value.lng)) return null;
    return { title: value.title || "", address: value.address || "", city: value.city || "", lat: value.lat, lng: value.lng };
  } catch {
    return null;
  }
}

export function saveMeetLocation(location: MeetLocation) {
  sessionStorage.setItem(SELECTED_LOCATION_KEY, JSON.stringify(location));
}

export function consumeMeetLocation() {
  const location = readMeetLocation();
  sessionStorage.removeItem(SELECTED_LOCATION_KEY);
  return location;
}

export function prepareMeetLocation(location: MeetLocation | null) {
  if (location) sessionStorage.setItem(INITIAL_LOCATION_KEY, JSON.stringify(location));
  else sessionStorage.removeItem(INITIAL_LOCATION_KEY);
}

export function consumeInitialMeetLocation() {
  const location = readMeetLocation(INITIAL_LOCATION_KEY);
  sessionStorage.removeItem(INITIAL_LOCATION_KEY);
  return location;
}

export function saveProfileLocation(location:MeetLocation){sessionStorage.setItem(PROFILE_LOCATION_KEY,JSON.stringify(location));}
export function consumeProfileLocation(){const location=readMeetLocation(PROFILE_LOCATION_KEY);sessionStorage.removeItem(PROFILE_LOCATION_KEY);return location;}
