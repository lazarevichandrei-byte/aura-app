export type GeocodedAddress = {
  city?: unknown;
  town?: unknown;
  municipality?: unknown;
  locality?: unknown;
  village?: unknown;
  hamlet?: unknown;
  suburb?: unknown;
  district?: unknown;
  city_district?: unknown;
  neighbourhood?: unknown;
  county?: unknown;
  state?: unknown;
};

function cleanPlaceName(value: unknown) {
  return typeof value === "string"
    ? value.replace(/^город\s+/i, "").replace(/\s+/g, " ").trim()
    : "";
}

export function normalizeGeocodedPlace(address: GeocodedAddress) {
  const populatedPlace = [
    address.city,
    address.town,
    address.municipality,
    address.locality,
    address.village,
    address.hamlet,
  ].map(cleanPlaceName).find(Boolean);

  if (populatedPlace) return populatedPlace;

  return [
    address.city_district,
    address.district,
    address.suburb,
    address.neighbourhood,
    address.county,
    address.state,
  ].map(cleanPlaceName).find(Boolean) || "";
}

type MapTilerFeature = {
  id?: string;
  text?: string;
  place_type?: string[];
  properties?: Record<string, unknown>;
  context?: MapTilerFeature[];
};

function localizedFeatureName(feature: MapTilerFeature | undefined, locale: string) {
  if (!feature) return "";
  const language = locale.split("-")[0];
  const properties = feature.properties || {};
  return cleanPlaceName(
    properties[`name:${locale}`] ||
    properties[`name:${language}`] ||
    properties[`name_${locale}`] ||
    properties[`name_${language}`] ||
    feature.text ||
    properties.name
  );
}

export function normalizeMapTilerPlace(features: MapTilerFeature[], locale = "en") {
  const candidates = features.flatMap((feature) => [feature, ...(feature.context || [])]);
  const findByTypes = (types: string[]) => candidates.find((feature) => {
    const idType = feature.id?.split(".")[0];
    return types.includes(idType || "") || feature.place_type?.some((type) => types.includes(type));
  });

  const populated = [
    ["city"],
    ["town"],
    ["municipality", "place"],
    ["locality"],
    ["village", "hamlet"],
  ].map((types) => localizedFeatureName(findByTypes(types), locale)).find(Boolean);

  if (populated) return populated;

  return ["city_district", "district", "suburb", "neighbourhood", "county", "region"]
    .map((type) => localizedFeatureName(findByTypes([type]), locale))
    .find(Boolean) || "";
}
