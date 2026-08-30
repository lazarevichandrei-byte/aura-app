begin;

alter table public.aura_user_feature_snapshots
  drop constraint if exists aura_user_feature_snapshots_feature_schema_version_check;
alter table public.aura_user_feature_snapshots
  add constraint aura_user_feature_snapshots_feature_schema_version_check
  check (feature_schema_version in (1,2));

alter table public.aura_pair_feature_snapshots
  drop constraint if exists aura_pair_feature_snapshots_feature_schema_version_check;
alter table public.aura_pair_feature_snapshots
  add constraint aura_pair_feature_snapshots_feature_schema_version_check
  check (feature_schema_version in (1,2));

alter table public.aura_match_score_snapshots
  drop constraint if exists aura_match_score_snapshots_feature_schema_version_check;
alter table public.aura_match_score_snapshots
  add constraint aura_match_score_snapshots_feature_schema_version_check
  check (feature_schema_version in (1,2));

alter table public.aura_match_score_snapshots
  drop constraint if exists aura_match_score_snapshots_score_version_check;
alter table public.aura_match_score_snapshots
  add constraint aura_match_score_snapshots_score_version_check
  check (score_version in (1,2,3));

-- Preserve the invariant that the new shadow model is only stored with schema v2.
alter table public.aura_match_score_snapshots
  drop constraint if exists aura_match_score_snapshots_version_schema_pair_check;
alter table public.aura_match_score_snapshots
  add constraint aura_match_score_snapshots_version_schema_pair_check
  check (
    (score_version in (1,2) and feature_schema_version=1)
    or (score_version=3 and feature_schema_version=2)
  );

commit;
