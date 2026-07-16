import { supabase } from "../supabase";

export async function createMeetEvent({

  creator_id,

  title,

  description,

  category,

  city,

  place,

  latitude,

  longitude,

  starts_at,

  max_people

}:{

  creator_id:string;

  title:string;

  description:string;

  category:string;

  city:string;

  place:string;

  latitude:number|null;

  longitude:number|null;

  starts_at:string;

  max_people:number;

}){

  const { data,error } =

    await supabase

      .from("meet_events")

      .insert({

        creator_id,

        title,

        description,

        category,

        city,

        place,

        latitude,

        longitude,

        starts_at,

        max_people

      })

      .select()

      .single();

  if(error){

    throw error;

  }

  return data;

}