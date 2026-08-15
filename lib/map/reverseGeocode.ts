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
    const context = place.context ?? [];
    const cityFeature = [place, ...context].find((item: any) =>
      ["municipality", "place", "locality"].some((type) => item.id?.startsWith(`${type}.`))
    );

    const title = place.text || place.properties?.name || place.place_name?.split(",")[0] || "";
    const address = place.place_name || place.properties?.label || title;

    return {
      title,
      address,
      city: cityFeature?.text || ""
    };

  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    throw error;

  }
}
