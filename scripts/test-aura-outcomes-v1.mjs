import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";

const outputDirectory=process.argv[2];if(!outputDirectory)throw new Error("OUTPUT_DIRECTORY_REQUIRED");
const require=createRequire(import.meta.url);
const {evaluateAuraOutcomeV1}=require(path.resolve(outputDirectory,"evaluate-v1.js"));
const {aggregateAuraOutcomeMetricsV1,aggregateAuraOutcomesByScoreBucketV1,auraScoreBucketV1}=require(path.resolve(outputDirectory,"metrics.js"));
const {isAuraOutcomeValuesV1}=require(path.resolve(outputDirectory,"contracts.js"));
const viewer="viewer";const candidate="candidate";const anchorAt="2026-01-01T00:00:00.000Z";
const event=(id,eventName,actorUserId=viewer,targetUserId=candidate,occurredAt="2026-01-01T01:00:00.000Z",extra={})=>({id,eventName,sourceType:eventName.startsWith("profile_")||eventName==="return_to_profile"?"client":"server",actorUserId,targetUserId,entityType:eventName==="profile_impression"?"user":"event",occurredAt,...extra});
const anchor=event("anchor","profile_impression",viewer,candidate,anchorAt);
const evaluate=(events=[],scoreSnapshots=[])=>evaluateAuraOutcomeV1({anchor,windowType:"24h",evaluatedAt:"2026-01-02T00:00:00.000Z",events,scoreSnapshots});
const neutral=evaluate();
assert.equal(isAuraOutcomeValuesV1(neutral.outcomes),true,"impression-only contract");
assert.deepEqual(neutral.outcomes,{profile_opened:false,return_to_profile:false,liked:false,passed:false,matched:false,chat_started:false,messages_sent_by_viewer:0,messages_sent_by_candidate:0,shared_meet_activity:false,viewer_joined_candidate_meet:false,candidate_joined_viewer_meet:false,blocked:false,reported:false});

const events=[
  event("open","profile_open"),event("return","return_to_profile"),event("like","like"),event("pass","pass"),event("match","match_created",candidate,viewer),event("chat","chat_started"),
  event("viewer-message","message_sent_metadata",viewer,null,undefined,{isDirectPairMessage:true}),event("candidate-message","message_sent_metadata",candidate,null,undefined,{isDirectPairMessage:true}),
  event("viewer-joined","meet_join_accepted",candidate,viewer),event("candidate-joined","meet_join_accepted",viewer,candidate),event("block","block"),event("report","report"),
  event("candidate-like","like",candidate,viewer),event("candidate-block","block",candidate,viewer),
  event("before","profile_open",viewer,candidate,"2025-12-31T23:59:59.000Z"),event("after","like",viewer,candidate,"2026-01-02T00:00:00.001Z"),
];
const scoreBefore={id:"score-before",viewerUserId:viewer,candidateUserId:candidate,featureSchemaVersion:1,scoreVersion:1,snapshotAt:"2025-12-31T23:00:00.000Z"};
const scoreAfter={...scoreBefore,id:"score-after",snapshotAt:"2026-01-01T00:00:00.001Z"};
const result=evaluate(events,[scoreAfter,scoreBefore]);
assert.deepEqual(result.outcomes,{profile_opened:true,return_to_profile:true,liked:true,passed:true,matched:true,chat_started:true,messages_sent_by_viewer:1,messages_sent_by_candidate:1,shared_meet_activity:true,viewer_joined_candidate_meet:true,candidate_joined_viewer_meet:true,blocked:true,reported:true});
assert.equal(result.scoreSnapshotId,"score-before","snapshot after anchor excluded");
assert.equal(evaluate([event("candidate-like-only","like",candidate,viewer)]).outcomes.liked,false,"candidate like is directional");
assert.equal(evaluate([event("candidate-message-only","message_sent_metadata",candidate,null,undefined,{isDirectPairMessage:true})]).outcomes.messages_sent_by_candidate,1,"candidate message direction");
assert.equal(evaluate([event("before-like","like",viewer,candidate,"2025-12-31T23:59:59.999Z")]).outcomes.liked,false,"event before anchor excluded");
assert.equal(evaluate([event("future-like","like",viewer,candidate,"2026-01-02T00:00:00.001Z")]).outcomes.liked,false,"event after window excluded");
assert.throws(()=>evaluateAuraOutcomeV1({anchor,windowType:"24h",evaluatedAt:"2026-01-01T23:59:59.999Z",events:[],scoreSnapshots:[]}),/WINDOW_NOT_COMPLETE/);

const metrics=aggregateAuraOutcomeMetricsV1([neutral.outcomes,result.outcomes]);
assert.deepEqual(metrics,{impression_count:2,open_rate:.5,like_rate:.5,pass_rate:.5,match_rate:.5,chat_start_rate:.5,meet_activity_rate:.5,block_rate:.5,report_rate:.5});
assert.deepEqual([0,19,20,39,40,59,60,79,80,100].map(auraScoreBucketV1),["0-19","0-19","20-39","20-39","40-59","40-59","60-79","60-79","80-100","80-100"]);
assert.equal(aggregateAuraOutcomesByScoreBucketV1([{totalScore:55,outcomes:result.outcomes}])["40-59"].match_rate,1);

const migration=fs.readFileSync(path.resolve(process.cwd(),"supabase/migrations/20260825020000_aura_match_outcomes_v1.sql"),"utf8").toLowerCase();
assert.match(migration,/occurred_at>anchor\.occurred_at and occurred_at<=window_ends/);
assert.match(migration,/score\.snapshot_at<=anchor\.occurred_at[\s\S]*order by score\.snapshot_at desc limit 1/);
assert.match(migration,/unique \(anchor_event_id,outcome_schema_version,window_type\)/,"duplicate outcome idempotency key");
assert.match(migration,/not exists\(select 1 from public\.aura_match_outcomes outcome where outcome\.anchor_event_id=event\.id\)/,"retained outcome protects cascading anchor from raw cleanup");
const persistence=fs.readFileSync(path.resolve(process.cwd(),"lib/server/match/outcomes/persistence.ts"),"utf8");
assert.match(persistence,/error\.code!=="23505"[\s\S]*eq\("anchor_event_id"[\s\S]*eq\("window_type"/,"duplicate returns existing row");
assert.doesNotMatch(migration,/messages\.(body|text)|report_body|latitude|longitude|coordinates/);
assert.match(migration,/grant select,insert,delete on table public\.aura_match_outcomes to service_role/);
assert.doesNotMatch(migration,/grant[^;]*update/);
console.log("AURA_OUTCOMES_V1_TESTS_PASS");
