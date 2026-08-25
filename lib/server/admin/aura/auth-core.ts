export type AdminInitDataValidator=(initData:string)=>{ok:true;user:{id:number}}|{ok:false;error:string};
export type AuraAdminAuthorization={ok:true;telegramId:string}|{ok:false;reason:"MISSING_INIT_DATA"|"INVALID_INIT_DATA"|"NOT_ADMIN"};

export function parseAuraAdminTelegramIds(value:string|undefined):ReadonlySet<string>{
  if(!value?.trim())return new Set();
  const tokens=value.split(",").map(token=>token.trim());
  if(tokens.some(token=>!/^[1-9]\d*$/.test(token)))return new Set();
  return new Set(tokens.map(token=>BigInt(token).toString()));
}

export function authorizeAuraAdminRequestV1({initData,allowlist,validate}:{initData:unknown;allowlist:string|undefined;validate:AdminInitDataValidator}):AuraAdminAuthorization{
  if(typeof initData!=="string"||initData.length===0)return {ok:false,reason:"MISSING_INIT_DATA"};
  const validation=validate(initData);
  if(!validation.ok)return {ok:false,reason:"INVALID_INIT_DATA"};
  const telegramId=BigInt(validation.user.id).toString();
  return parseAuraAdminTelegramIds(allowlist).has(telegramId)?{ok:true,telegramId}:{ok:false,reason:"NOT_ADMIN"};
}
