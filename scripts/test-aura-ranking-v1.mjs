import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";

const outputDirectory=process.argv[2];
if(!outputDirectory)throw new Error("OUTPUT_DIRECTORY_REQUIRED");
const require=createRequire(import.meta.url);
const {rerankCandidatesV1,AURA_RANKING_V1}=require(path.resolve(outputDirectory,"recommendation/rank-v1.js"));
const {buildAuraScoresForCandidatesV1}=require(path.resolve(outputDirectory,"recommendation/execution-v1.js"));
const ids=values=>values.map(value=>value.id);
const candidates=Array.from({length:12},(_,index)=>({id:`candidate-${index}`,base:index}));

const descendingScores=candidates.slice(0,30).map((candidate,index)=>({candidateId:candidate.id,totalScore:index%5===4?100:0}));
const ranked=rerankCandidatesV1(candidates,descendingScores);
assert.notDeepEqual(ids(ranked),ids(candidates),"all available scores rerank");
for(const [index,candidate] of ranked.entries())assert.equal(Math.floor(index/AURA_RANKING_V1.RERANK_WINDOW_SIZE),Math.floor(candidates.findIndex(value=>value.id===candidate.id)/AURA_RANKING_V1.RERANK_WINDOW_SIZE),"candidate stays inside original window");
assert.deepEqual(ids(rerankCandidatesV1(candidates,descendingScores.slice(1))),ids(candidates),"one score failure preserves base order");
assert.deepEqual(ids(rerankCandidatesV1(candidates,[])),ids(candidates),"all score failures preserve base order");
assert.deepEqual(ids(rerankCandidatesV1(candidates,candidates.map(candidate=>({candidateId:candidate.id,totalScore:50})))),ids(candidates),"equal scores preserve base order");
assert.deepEqual(ids(rerankCandidatesV1(candidates,[...candidates.map(candidate=>({candidateId:candidate.id,totalScore:0})),{candidateId:"candidate-3",totalScore:0}])),ids(candidates),"score ties use existing position");
assert.deepEqual(rerankCandidatesV1([],[]),[],"no candidates");
assert.deepEqual(rerankCandidatesV1([candidates[0]],[{candidateId:candidates[0].id,totalScore:100}]),[candidates[0]],"one candidate");
const eligibleSubset=[candidates[2],candidates[5],candidates[9]];
assert.deepEqual(new Set(ids(rerankCandidatesV1(eligibleSubset,eligibleSubset.map((candidate,index)=>({candidateId:candidate.id,totalScore:index*50}))))),new Set(ids(eligibleSubset)),"ranking does not add eligibility");
assert.deepEqual(rerankCandidatesV1(candidates,descendingScores),rerankCandidatesV1(candidates,descendingScores),"ranking deterministic");

const timestamp="2026-08-25T12:00:00.000Z";
const user={photo_count:1,has_bio:true,has_city:true,profile_completeness_bucket:"high",likes_7d:0,passes_7d:0,matches_30d:0,profile_impressions_received_7d:0,profile_opens_received_7d:0,active_days_7d:0,active_days_30d:0,last_activity_age_bucket:"30d_plus",chats_started_30d:0,messages_sent_30d:0,meet_created_30d:0,meet_join_requests_30d:0,meet_join_accepted_30d:0,meet_participations_30d:0,blocks_created_90d:0,reports_created_90d:0};
const pair={impressions_7d:0,impressions_30d:0,opens_7d:0,opens_30d:0,return_to_profile_30d:0,max_dwell_bucket_30d:"none",recent_impression_age_bucket:"none",prior_like_from_viewer:false,prior_like_from_candidate:false,prior_match:false,prior_reject:false,current_cycle_status:"none",cooldown_active:false,has_existing_direct_chat:false,prior_chat_started:false,shared_meet_count_90d:0,viewer_joined_candidate_meet_90d:false,candidate_joined_viewer_meet_90d:false,age_difference:null,same_city:null};
const calls={viewer:0,candidate:0,pair:0,timestamps:[]};
const dependencies={
  buildUserFeatures:async(userId,snapshotAt)=>{calls.timestamps.push(snapshotAt);if(userId==="viewer")calls.viewer+=1;else calls.candidate+=1;return {featureSchemaVersion:1,snapshotAt,features:user};},
  buildPairFeatures:async(_viewerId,_candidateId,snapshotAt)=>{calls.pair+=1;calls.timestamps.push(snapshotAt);return {featureSchemaVersion:1,snapshotAt,features:pair};},
};
const bounded=Array.from({length:35},(_,index)=>({id:`bounded-${index}`}));
const scores=await buildAuraScoresForCandidatesV1("viewer",bounded,timestamp,dependencies);
assert.equal(scores.length,20,"scoring batch bounded at 20");
assert.deepEqual(calls,{viewer:1,candidate:20,pair:20,timestamps:Array(41).fill(timestamp)},"viewer built once and one request timestamp reused");

const route=fs.readFileSync(path.resolve(process.cwd(),"app/api/discovery/route.ts"),"utf8");
assert.match(route,/get_dating_feed[\s\S]*rankCandidatesWithAuraV1/);
assert.match(route,/const rankingSnapshotAt=new Date\(\)\.toISOString\(\)/);
assert.doesNotMatch(route,/auraScore|components|reasons|featureSnapshot/);
const service=fs.readFileSync(path.resolve(process.cwd(),"lib/server/match/recommendation/service.ts"),"utf8");
assert.match(service,/return mode==="enabled"\?ranked:\[\.\.\.candidates\]/);
assert.match(service,/catch\(error\)[\s\S]*return \[\.\.\.candidates\]/);
assert.doesNotMatch(service,/Math\.random/);
console.log("AURA_RANKING_V1_TESTS_PASS");
