import {NextResponse} from "next/server";
import {authorizeAuraAdmin} from "../../../../../lib/server/admin/aura";
import {supabaseAdmin} from "../../../../../lib/supabase-admin";

export const runtime="nodejs";
export const dynamic="force-dynamic";

type PairRow={viewer_user_id:string;candidate_user_id:string;snapshot_at:string;features:Record<string,unknown>};
type ScoreRow={viewer_user_id:string;candidate_user_id:string;score_version:number;snapshot_at:string;total_score:number;components:Record<string,unknown>;reasons:unknown[];flags:Record<string,unknown>};

const pairKey=(a:string,b:string)=>`${a}:${b}`;

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const authorization=authorizeAuraAdmin(body?.initData);
    if(!authorization.ok)return NextResponse.json({ok:false,error:"NOT_FOUND"},{status:404});

    const mode=body?.mode==="detail"?"detail":"list";
    if(mode==="list"){
      const {data:pairRows,error:pairError}=await supabaseAdmin.from("aura_pair_feature_snapshots")
        .select("viewer_user_id,candidate_user_id,snapshot_at,features")
        .order("snapshot_at",{ascending:false}).limit(250);
      if(pairError)throw pairError;

      const latest=new Map<string,PairRow>();
      for(const row of (pairRows??[]) as PairRow[]){
        const key=pairKey(row.viewer_user_id,row.candidate_user_id);
        if(!latest.has(key))latest.set(key,row);
      }
      const pairs=[...latest.values()].slice(0,60);
      const ids=[...new Set(pairs.flatMap(row=>[row.viewer_user_id,row.candidate_user_id]))];
      const [{data:users,error:userError},{data:scores,error:scoreError}]=await Promise.all([
        ids.length?supabaseAdmin.from("users").select("id,name,telegram_id").in("id",ids):Promise.resolve({data:[],error:null}),
        supabaseAdmin.from("aura_match_score_snapshots").select("viewer_user_id,candidate_user_id,score_version,snapshot_at,total_score,components,reasons,flags").order("snapshot_at",{ascending:false}).limit(500),
      ]);
      if(userError)throw userError;if(scoreError)throw scoreError;
      const userMap=new Map((users??[]).map((u:any)=>[u.id,u]));
      const latestScores=new Map<string,ScoreRow>();
      for(const row of (scores??[]) as ScoreRow[]){const key=pairKey(row.viewer_user_id,row.candidate_user_id);if(!latestScores.has(key))latestScores.set(key,row);}
      return NextResponse.json({ok:true,pairs:pairs.map(row=>({
        viewer:userMap.get(row.viewer_user_id)??{id:row.viewer_user_id,name:"Unknown"},
        candidate:userMap.get(row.candidate_user_id)??{id:row.candidate_user_id,name:"Unknown"},
        snapshotAt:row.snapshot_at,features:row.features,latestScore:latestScores.get(pairKey(row.viewer_user_id,row.candidate_user_id))??null,
      }))});
    }

    const viewerUserId=typeof body?.viewerUserId==="string"?body.viewerUserId:"";
    const candidateUserId=typeof body?.candidateUserId==="string"?body.candidateUserId:"";
    const includeMessages=body?.includeMessages===true;
    if(!viewerUserId||!candidateUserId||viewerUserId===candidateUserId)return NextResponse.json({ok:false,error:"INVALID_PAIR"},{status:400});

    const [usersResult,pairResult,scoresResult,chatResult]=await Promise.all([
      supabaseAdmin.from("users").select("id,name,telegram_id").in("id",[viewerUserId,candidateUserId]),
      supabaseAdmin.from("aura_pair_feature_snapshots").select("snapshot_at,features").eq("viewer_user_id",viewerUserId).eq("candidate_user_id",candidateUserId).order("snapshot_at",{ascending:false}).limit(10),
      supabaseAdmin.from("aura_match_score_snapshots").select("score_version,snapshot_at,total_score,components,reasons,flags").eq("viewer_user_id",viewerUserId).eq("candidate_user_id",candidateUserId).order("snapshot_at",{ascending:false}).limit(20),
      supabaseAdmin.from("chats").select("id,user1_id,user2_id,event_id").is("event_id",null).or(`and(user1_id.eq.${viewerUserId},user2_id.eq.${candidateUserId}),and(user1_id.eq.${candidateUserId},user2_id.eq.${viewerUserId})`).maybeSingle(),
    ]);
    if(usersResult.error)throw usersResult.error;if(pairResult.error)throw pairResult.error;if(scoresResult.error)throw scoresResult.error;if(chatResult.error)throw chatResult.error;
    let messages:any[]=[];
    if(includeMessages&&chatResult.data?.id){
      const messageResult=await supabaseAdmin.from("messages").select("id,sender_id,body,created_at,message_type").eq("chat_id",chatResult.data.id).order("created_at",{ascending:false}).limit(100);
      if(messageResult.error)throw messageResult.error;
      messages=(messageResult.data??[]).reverse();
      console.info("AURA_ADMIN_RAW_MESSAGES_REVEALED",{adminTelegramId:authorization.telegramId,viewerUserId,candidateUserId,messageCount:messages.length});
    }
    return NextResponse.json({ok:true,detail:{users:usersResult.data??[],pairSnapshots:pairResult.data??[],scores:scoresResult.data??[],chat:chatResult.data??null,messages,messagesIncluded:includeMessages}});
  }catch(error){
    console.error("AURA_ADMIN_CONVERSATIONS_ERROR",{code:error instanceof Error?error.message:"UNKNOWN"});
    return NextResponse.json({ok:false,error:"CONVERSATION_DIAGNOSTICS_UNAVAILABLE"},{status:500});
  }
}
