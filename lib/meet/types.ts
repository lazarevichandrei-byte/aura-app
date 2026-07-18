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
    avatar_url: string | null;
  };

}