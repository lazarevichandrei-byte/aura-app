export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
) {
  try {
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    const res = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${key}`,
      { signal }
    );

    if (!res.ok) throw new Error(`GEOCODER_HTTP_${res.status}`);

    const data = await res.json();

    if (!data.features?.length) throw new Error("GEOCODER_EMPTY_RESULT");

    const place = data.features[0];
    const candidates=data.features.flatMap((feature:any)=>[feature,...(feature.context||[])]);
    const cityFeature=["place","town","locality","municipality","village"].map((type)=>candidates.find((item:any)=>item.id?.startsWith(`${type}.`))).find(Boolean);

    const title = place.text || place.properties?.name || place.place_name?.split(",")[0] || "";
    const address = place.place_name || place.properties?.label || title;

    return {
      title,
      address,
      city: normalizeProfileCity(cityFeature?.text || cityFeature?.properties?.name || "")
    };

  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    throw error;

  }
}

export function normalizeProfileCity(value:string){return value.replace(/^город\s+/i,"").replace(/\s+/g," ").trim();}
