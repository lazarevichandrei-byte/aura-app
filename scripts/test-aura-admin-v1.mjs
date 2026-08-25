import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";

const outputDirectory=process.argv[2];if(!outputDirectory)throw new Error("OUTPUT_DIRECTORY_REQUIRED");
const require=createRequire(import.meta.url);
const {authorizeAuraAdminRequestV1,parseAuraAdminTelegramIds}=require(path.resolve(outputDirectory,"auth-core.js"));
const {isAuraAdminOverviewV1,parseAuraAdminOutcomeWindow,parseAuraAdminTimeframe}=require(path.resolve(outputDirectory,"contracts.js"));
const valid=id=>()=>({ok:true,user:{id}});const invalid=()=>({ok:false,error:"INVALID_HASH"});
assert.deepEqual(authorizeAuraAdminRequestV1({initData:"",allowlist:"123",validate:valid(123)}),{ok:false,reason:"MISSING_INIT_DATA"});
assert.deepEqual(authorizeAuraAdminRequestV1({initData:"signed",allowlist:"123",validate:invalid}),{ok:false,reason:"INVALID_INIT_DATA"});
assert.deepEqual(authorizeAuraAdminRequestV1({initData:"signed",allowlist:"456",validate:valid(123)}),{ok:false,reason:"NOT_ADMIN"});
assert.deepEqual(authorizeAuraAdminRequestV1({initData:"signed",allowlist:"123,456",validate:valid(123)}),{ok:true,telegramId:"123"});
assert.deepEqual(authorizeAuraAdminRequestV1({initData:"signed",allowlist:undefined,validate:valid(123)}),{ok:false,reason:"NOT_ADMIN"},"missing env denies all");
assert.equal(parseAuraAdminTelegramIds("123,bad").size,0,"malformed allowlist fails closed");
assert.equal(parseAuraAdminTimeframe("anything"),"7d");assert.equal(parseAuraAdminTimeframe("24h"),"24h");assert.equal(parseAuraAdminOutcomeWindow("anything"),"24h");

const base={generatedAt:"2026-08-25T12:00:00.000Z",timeframe:"7d",outcomeWindow:"24h",ranking:{mode:"shadow",diagnosticsPersisted:false},events:{last1h:0,last24h:0,timeframeCount:0,latestReceivedAt:null,clientCount:0,serverCount:0,health:"empty"},features:{userLast24h:0,pairLast24h:0,latestSnapshotAt:null,health:"empty"},scores:{last24h:0,timeframeCount:0,latestSnapshotAt:null,health:"empty",distribution:["0-19","20-39","40-59","60-79","80-100"].map(bucket=>({bucket,count:0,percent:0}))},outcomes:{totalByWindow:{"24h":0,"7d":0,"30d":0},latestEvaluatedAt:null,nullScoreLinks:0,selectedCount:0,health:"empty"},coverage:["24h","7d","30d"].map(windowType=>({windowType,eligibleAnchors:0,materialized:0,missing:0,coverageRate:0})),scoreOutcome:["0-19","20-39","40-59","60-79","80-100"].map(bucket=>({bucket,count:0,openRate:0,likeRate:0,passRate:0,matchRate:0,chatStartRate:0,meetActivityRate:0,blockRate:0,reportRate:0}))};
for(const fixture of [base,{...base,events:{...base.events,last1h:2,last24h:4,timeframeCount:5,health:"healthy"}},{...base,scores:{...base.scores,last24h:3,timeframeCount:3,health:"healthy"}},{...base,outcomes:{...base.outcomes,selectedCount:4,nullScoreLinks:4,health:"healthy"}},{...base,ranking:{mode:"enabled",diagnosticsPersisted:false},events:{...base.events,health:"stale"},outcomes:{...base.outcomes,health:"gap"}}])assert.equal(isAuraAdminOverviewV1(fixture),true);
assert.equal(isAuraAdminOverviewV1({...base,ranking:{mode:"invalid",diagnosticsPersisted:false}}),false);

const route=fs.readFileSync(path.resolve(process.cwd(),"app/api/admin/aura/overview/route.ts"),"utf8");
assert.match(route,/authorizeAuraAdmin\(body\?\.initData\)/);assert.doesNotMatch(route,/body\?\.(telegramId|telegram_id|admin)/);
const service=fs.readFileSync(path.resolve(process.cwd(),"lib/server/admin/aura/service.ts"),"utf8");
assert.match(service,/aura_admin_audit_log/);assert.match(service,/AURA_ADMIN_OVERVIEW_VIEW/);assert.doesNotMatch(service,/features:|reasons:|message|report|latitude|longitude/);
const migration=fs.readFileSync(path.resolve(process.cwd(),"supabase/migrations/20260825030000_aura_admin_v1.sql"),"utf8").toLowerCase();
assert.match(migration,/alter table public\.aura_admin_audit_log enable row level security/);
assert.match(migration,/revoke all on table public\.aura_admin_audit_log from public,anon,authenticated,service_role/);
assert.doesNotMatch(migration,/grant[^;]*update/);assert.match(migration,/interval '365 days'/);
for(const table of ["aura_interaction_events","aura_user_feature_snapshots","aura_pair_feature_snapshots","aura_match_score_snapshots","aura_match_outcomes"])assert.doesNotMatch(migration,new RegExp(`grant[^;]*on table public\\.${table}[^;]*to (?:public|anon|authenticated)`));
assert.doesNotMatch(migration,/messages\.(body|text)|report_body|latitude|longitude|coordinates/);
const page=fs.readFileSync(path.resolve(process.cwd(),"app/admin/aura/page.tsx"),"utf8");assert.match(page,/Observational/);assert.doesNotMatch(page,/supabase|accuracy|causes/);
console.log("AURA_ADMIN_V1_TESTS_PASS");
