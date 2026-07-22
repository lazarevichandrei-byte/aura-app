export interface MeetEvent {

  id: string;

  creator_id: string;

  title: string;

  description: string;

  category: string;

  city: string;

  place: string;

  latitude: number | null;

  longitude: number | null;

  starts_at: string;

  max_people: number;

  is_premium: boolean;

  is_active: boolean;

  created_at: string;

    users?: {
  id: string;
  name: string;
  age: number | null;
  city: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  is_online: boolean;
  last_seen: string | null;
  show_online: boolean;
  show_last_seen: boolean;
};

meet_participants?: {
  joined_at: string;
  users: {
    id: string;
    name: string;
    avatar_url: string | null;
    photos: string[] | null;
  };
}[];

}