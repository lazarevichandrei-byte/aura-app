export async function reverseGeocode(
  lat: number,
  lng: number
) {
  try {
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    const res = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${key}`
    );

    const data = await res.json();

    if (!data.features?.length) {
      return {
        title: "",
        address: ""
      };
    }

    const place = data.features[0];

    return {
      title:
        place.text ||
        place.place_name?.split(",")[0] ||
        "Неизвестное место",

      address:
        place.place_name || ""
    };

  } catch {

    return {
      title: "",
      address: ""
    };

  }
}