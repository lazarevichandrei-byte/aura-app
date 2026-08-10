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

    const data = await res.json();

    if (!data.features?.length) {
      return {
        title: "",
        address: "",
        city: ""
      };
    }

    const place = data.features[0];
    const context = place.context ?? [];
    const cityFeature = context.find((item: any) =>
      ["municipality", "place", "locality"].some((type) => item.id?.startsWith(`${type}.`))
    );

    return {
      title:
        place.text ||
        place.place_name?.split(",")[0] ||
        "Неизвестное место",

      address:
        place.place_name || "",
      city: cityFeature?.text || ""
    };

  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    return {
      title: "",
      address: "",
      city: ""
    };

  }
}
