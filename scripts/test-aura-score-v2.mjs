import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";

const outDir=process.argv[2];
if(!outDir)throw new Error("OUT_DIR_REQUIRED");
const require=createRequire(import.meta.url);
const {scoreAuraMatchV2}=require(path.resolve(outDir,"score/score-v2.js"));

const user={photo_count:3,has_bio:true,has_city:true,profile_completeness_bucket:"high",likes_7d:2,passes_7d:1,matches_30d:1,profile_impressions_received_7d:3,profile_opens_received_7d:1,active_days_7d:3,active_days_30d:8,last_activity_age_bucket:"lt_1d",chats_started_30d:1,messages_sent_30d:8,meet_created_30d:0,meet_join_requests_30d:0,meet_join_accepted_30d:0,meet_participations_30d:0,blocks_created_90d:0,reports_created_90d:0};
const basePair={impressions_7d:1,impressions_30d:2,opens_7d:1,opens_30d:1,return_to_profile_30d:0,max_dwell_bucket_30d:"5_15s",recent_impression_age_bucket:"lt_1h",prior_like_from_viewer:false,prior_like_from_candidate:false,prior_match:false,prior_reject:false,current_cycle_status:"none",cooldown_active:false,has_existing_direct_chat:true,prior_chat_started:true,shared_meet_count_90d:0,viewer_joined_candidate_meet_90d:false,candidate_joined_viewer_meet_90d:false,age_difference:2,same_city:true,direct_message_count_30d:0,viewer_message_count_30d:0,candidate_message_count_30d:0,viewer_avg_message_chars_30d:0,candidate_avg_message_chars_30d:0,viewer_median_message_chars_30d:0,candidate_median_message_chars_30d:0,viewer_long_messages_30d:0,candidate_long_messages_30d:0,viewer_short_messages_30d:0,candidate_short_messages_30d:0,viewer_question_messages_30d:0,candidate_question_messages_30d:0,viewer_meet_intent_messages_30d:0,candidate_meet_intent_messages_30d:0,viewer_median_reply_seconds_30d:null,candidate_median_reply_seconds_30d:null,active_chat_days_30d:0,conversation_span_days:0,longest_viewer_burst:0,longest_candidate_burst:0,message_balance_ratio:0,viewer_started_conversation:false,candidate_started_conversation:false,mutual_conversation:false};
const input=pair=>({viewerFeatures:user,candidateFeatures:user,pairFeatures:pair,featureSchemaVersion:1,snapshotAt:"2026-08-26T09:00:00.000Z"});

const noConversation=scoreAuraMatchV2(input(basePair));
assert.equal(noConversation.scoreVersion,2);
assert.ok(noConversation.totalScore>=0&&noConversation.totalScore<=100);

const balanced={...basePair,direct_message_count_30d:24,viewer_message_count_30d:12,candidate_message_count_30d:12,viewer_avg_message_chars_30d:70,candidate_avg_message_chars_30d:75,viewer_median_message_chars_30d:55,candidate_median_message_chars_30d:60,viewer_long_messages_30d:2,candidate_long_messages_30d:2,viewer_short_messages_30d:2,candidate_short_messages_30d:2,viewer_question_messages_30d:4,candidate_question_messages_30d:3,viewer_meet_intent_messages_30d:1,candidate_meet_intent_messages_30d:0,viewer_median_reply_seconds_30d:180,candidate_median_reply_seconds_30d:240,active_chat_days_30d:5,conversation_span_days:7,longest_viewer_burst:3,longest_candidate_burst:3,message_balance_ratio:1,viewer_started_conversation:true,candidate_started_conversation:false,mutual_conversation:true};
const good=scoreAuraMatchV2(input(balanced));
assert.ok(good.totalScore>noConversation.totalScore,"balanced conversation should improve V2 score");
assert.ok(good.components.reciprocity>=noConversation.components.reciprocity);
assert.ok(good.components.engagement>=noConversation.components.engagement);

const oneSided={...balanced,viewer_message_count_30d:22,candidate_message_count_30d:2,message_balance_ratio:0.09,active_chat_days_30d:1,viewer_question_messages_30d:3,candidate_question_messages_30d:0,viewer_meet_intent_messages_30d:0,candidate_meet_intent_messages_30d:0};
const weak=scoreAuraMatchV2(input(oneSided));
assert.ok(weak.totalScore<good.totalScore,"strongly one-sided conversation should score below balanced conversation");

const cooldown=scoreAuraMatchV2(input({...balanced,cooldown_active:true}));
assert.ok(cooldown.totalScore<=55,"cooldown cap must remain enforced in V2");

console.log("AURA_SCORE_V2_TESTS_PASS",{noConversation:noConversation.totalScore,balanced:good.totalScore,oneSided:weak.totalScore,cooldown:cooldown.totalScore});
