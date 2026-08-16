import {NextResponse} from "next/server";
import {normalizeGeocodedPlace,type GeocodedAddress} from "../../../lib/location/normalizeGeocodedPlace";

type NominatimResult={address?:GeocodedAddress;name?:string;lat?:string;lon?:string};

function cityFromAddress(address:unknown){return normalizeGeocodedPlace((address&&typeof address==="object"?address:{}) as GeocodedAddress);}

export async function GET(request:Request){
  const url=new URL(request.url);
  const latRaw=url.searchParams.get("lat");
  const lngRaw=url.searchParams.get("lng");
  const lat=latRaw===null?NaN:Number(latRaw);
  const lng=lngRaw===null?NaN:Number(lngRaw);
  const query=url.searchParams.get("city")?.trim();
  const language=(url.searchParams.get("language")||"en").slice(0,16);
  try{
    if(Number.isFinite(lat)&&Number.isFinite(lng)){
      const response=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=${encodeURIComponent(language)}`,{headers:{Accept:"application/json","User-Agent":"AURA Mini App location resolver"},cache:"no-store"});
      if(!response.ok)throw new Error(`REVERSE_${response.status}`);
      const data=await response.json();
      return NextResponse.json({ok:true,city:cityFromAddress(data.address)});
    }
    if(query){
      const response=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&featuretype=city&accept-language=${encodeURIComponent(language)}`,{headers:{Accept:"application/json","User-Agent":"AURA Mini App city search"},cache:"no-store"});
      if(!response.ok)throw new Error(`SEARCH_${response.status}`);
      const data=await response.json();
      const results=(Array.isArray(data)?data as NominatimResult[]:[]).map((item)=>({city:cityFromAddress(item.address)||String(item.name||"").trim(),lat:Number(item.lat),lng:Number(item.lon)})).filter((item)=>item.city&&Number.isFinite(item.lat)&&Number.isFinite(item.lng));
      return NextResponse.json({ok:true,results});
    }
    return NextResponse.json({ok:false,error:"LOCATION_PARAMS_REQUIRED"},{status:400});
  }catch{return NextResponse.json({ok:false,error:"LOCATION_RESOLUTION_FAILED"},{status:502});}
}
