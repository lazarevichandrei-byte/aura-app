import assert from "node:assert/strict";
import {pathToFileURL} from "node:url";
import path from "node:path";

const compiledRoot=process.argv[2];
if(!compiledRoot)throw new Error("MISSING_COMPILED_ROOT");
const moduleUrl=pathToFileURL(path.join(compiledRoot,"read-signals-core.js")).href;
const {aggregateConversationReadSignalsV1}=await import(moduleUrl);

const viewer="00000000-0000-0000-0000-000000000001";
const candidate="00000000-0000-0000-0000-000000000002";
const snapshotAt="2026-08-30T12:00:00.000Z";

const rows=[
  {sender_id:viewer,created_at:"2026-08-29T10:00:00.000Z",is_read:true,read_at:"2026-08-29T10:00:30.000Z"},
  {sender_id:viewer,created_at:"2026-08-29T11:00:00.000Z",is_read:true,read_at:"2026-08-29T11:02:00.000Z"},
  {sender_id:viewer,created_at:"2026-08-28T09:00:00.000Z",is_read:false,read_at:null},
  {sender_id:candidate,created_at:"2026-08-29T12:00:00.000Z",is_read:true,read_at:"2026-08-29T12:01:00.000Z"},
  {sender_id:candidate,created_at:"2026-08-30T11:30:00.000Z",is_read:false,read_at:null},
];

const result=aggregateConversationReadSignalsV1(rows,viewer,candidate,snapshotAt);
assert.equal(result.viewer_sent_30d,3);
assert.equal(result.candidate_sent_30d,2);
assert.equal(result.viewer_messages_read_by_candidate_30d,2);
assert.equal(result.candidate_messages_read_by_viewer_30d,1);
assert.equal(result.viewer_message_read_rate_30d,0.6667);
assert.equal(result.candidate_message_read_rate_30d,0.5);
assert.equal(result.viewer_median_read_seconds_30d,75);
assert.equal(result.candidate_median_read_seconds_30d,60);
assert.equal(result.viewer_unread_older_than_24h_30d,1);
assert.equal(result.candidate_unread_older_than_24h_30d,0);

const empty=aggregateConversationReadSignalsV1([],viewer,candidate,snapshotAt);
assert.equal(empty.viewer_message_read_rate_30d,0);
assert.equal(empty.viewer_median_read_seconds_30d,null);

assert.throws(()=>aggregateConversationReadSignalsV1([],viewer,candidate,"bad-date"),/INVALID_SNAPSHOT_AT/);
console.log("AURA read signals v1 tests passed");
