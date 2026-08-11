import type { MeetEvent } from "./types";

export function getMeetGuests(event: Pick<MeetEvent, "creator_id" | "meet_participants">) {
  return (event.meet_participants ?? []).filter(
    (participant) => participant.users.id !== event.creator_id
  );
}

export function getMeetGuestCount(event: Pick<MeetEvent, "creator_id" | "meet_participants">) {
  return getMeetGuests(event).length;
}
