import type {AuraPairFeaturesV1,AuraUserFeaturesV1} from "./types";
import type {AuraConversationReadSignalsV1} from "./read-signals";

export const FEATURE_SCHEMA_VERSION_V2=2 as const;

export type AuraUserFeaturesV2=AuraUserFeaturesV1;
export type AuraPairFeaturesV2=AuraPairFeaturesV1&AuraConversationReadSignalsV1;

export type FeatureSnapshotV2<T>={
  featureSchemaVersion:2;
  snapshotAt:string;
  features:T;
};
