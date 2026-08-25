import {createRequire} from "node:module";
import path from "node:path";
const outputDirectory=process.argv[2];
if(!outputDirectory)throw new Error("OUTPUT_DIRECTORY_REQUIRED");
const require=createRequire(import.meta.url);
const {scoreAuraMatchV1}=require(path.resolve(outputDirectory,"score/score-v1.js"));
const user={photo_count:1,has_bio:true,has_city:true,profile_completeness_bucket:"high",likes_7d:0,passes_7d:0,matches_30d:0,profile_impressions_received_7d:0,profile_opens_received_7d:0,active_days_7d:0,active_days_30d:0,last_activity_age_bucket:"30d_plus",chats_started_30d:0,messages_sent_30d:0,meet_created_30d:0,meet_join_requests_30d:0,meet_join_accepted_30d:0,meet_participations_30d:0,blocks_created_90d:0,reports_created_90d:0};
const pair={impressions_7d:0,impressions_30d:0,opens_7d:0,opens_30d:0,return_to_profile_30d:0,max_dwell_bucket_30d:"none",recent_impression_age_bucket:"none",prior_like_from_viewer:false,prior_like_from_candidate:false,prior_match:false,prior_reject:false,current_cycle_status:"none",cooldown_active:false,has_existing_direct_chat:false,prior_chat_started:false,shared_meet_count_90d:0,viewer_joined_candidate_meet_90d:false,candidate_joined_viewer_meet_90d:false,age_difference:null,same_city:null};
const variants=[];
for(const same_city of [null,true])for(const age_difference of [null,2,8])for(const likes of [0,1,2])for(const dwell of ["none","5_15s","30s_plus"])for(const activity of [0,1]){
  const active=activity?{...user,active_days_7d:4,active_days_30d:10,last_activity_age_bucket:"lt_1d",messages_sent_30d:5}:{...user};
  variants.push(scoreAuraMatchV1({viewerFeatures:active,candidateFeatures:active,pairFeatures:{...pair,same_city,age_difference,prior_like_from_viewer:likes>=1,prior_like_from_candidate:likes>=2,max_dwell_bucket_30d:dwell},featureSchemaVersion:1,snapshotAt:"2026-08-25T12:00:00.000Z"}).totalScore);
}
variants.sort((a,b)=>a-b);
const percentile=p=>variants[Math.floor((variants.length-1)*p)];
console.log(JSON.stringify({count:variants.length,min:variants[0],p25:percentile(.25),median:percentile(.5),p75:percentile(.75),max:variants.at(-1)},null,2));
