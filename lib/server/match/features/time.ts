export function normalizeSnapshotAt(value:string|Date){
  const date=value instanceof Date?value:new Date(value);
  if(!Number.isFinite(date.getTime()))throw new Error("INVALID_SNAPSHOT_AT");
  return date.toISOString();
}

