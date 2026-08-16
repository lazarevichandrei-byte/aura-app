import {redirect} from "next/navigation";

export default async function MeetDetailsPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  redirect(`/meet?event=${encodeURIComponent(id)}`);
}
