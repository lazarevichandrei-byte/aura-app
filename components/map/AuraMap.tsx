"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLE } from "../../lib/map/styles";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "../../lib/map/map";
import type { MeetEvent } from "../../lib/meet/types";
import { MEET_CATEGORIES } from "../../lib/meet/categories";
import { useNotification } from "../NotificationContext";

type Coordinates = { lat: number; lng: number };

type Props = {
  events?: MeetEvent[];
  mode?: "create" | "view";
  initialCenter?: Coordinates | null;
  onCenterChanged?: (lat: number, lng: number) => void;
  onMarkerClick?: (event: MeetEvent) => void;
  category?: string | null;
  selectedEvent?: MeetEvent | null;
};

export type AuraMapRef = {
  zoomIn: () => void;
  zoomOut: () => void;
  flyToUser: () => Promise<Coordinates | null>;
};

const AuraMap = forwardRef<AuraMapRef, Props>(function AuraMap({
  mode = "create",
  events = [],
  initialCenter,
  onCenterChanged,
  onMarkerClick,
  category,
}, ref) {
  const { error: showError } = useNotification();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const eventMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const onCenterChangedRef = useRef(onCenterChanged);
  const onMarkerClickRef = useRef(onMarkerClick);
  const initialCenterRef = useRef(initialCenter);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
    onMarkerClickRef.current = onMarkerClick;
  }, [onCenterChanged, onMarkerClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!key) {
      setMapError(true);
      return;
    }

    const saved = readSavedLocation();
    const start = initialCenterRef.current ?? saved ?? DEFAULT_CENTER;
    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE({ key }),
      center: [start.lng, start.lat],
      zoom: initialCenterRef.current || saved ? 16 : DEFAULT_ZOOM,
      attributionControl: false,
    });
    mapRef.current = map;
    let iconFallbacksSanitized = false;

    const handleStyleData = () => {
      if (iconFallbacksSanitized || !map.isStyleLoaded()) return;
      iconFallbacksSanitized = true;
      for (const layer of map.getStyle().layers ?? []) {
        if (layer.type !== "symbol") continue;
        const iconImage = layer.layout?.["icon-image"];
        if (!iconImage || !containsEmptyString(iconImage)) continue;
        map.setLayoutProperty(layer.id, "icon-image", replaceEmptyStrings(iconImage));
      }
    };

    const handleLoad = () => {
      setLoaded(true);
      map.resize();
      const center = map.getCenter();
      onCenterChangedRef.current?.(center.lat, center.lng);
    };
    const handleMoveEnd = () => {
      const center = map.getCenter();
      onCenterChangedRef.current?.(center.lat, center.lng);
    };
    const handleError = (event: maplibregl.ErrorEvent) => {
      console.error("MAP LOAD ERROR:", event.error);
      if (!map.loaded()) setMapError(true);
    };
    map.on("load", handleLoad);
    map.on("styledata", handleStyleData);
    map.on("moveend", handleMoveEnd);
    map.on("error", handleError);

    const resize = () => map.resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    const telegram = (window as Window & {
      Telegram?: { WebApp?: { onEvent?: (name: string, callback: () => void) => void; offEvent?: (name: string, callback: () => void) => void } };
    }).Telegram?.WebApp;
    telegram?.onEvent?.("viewportChanged", resize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      telegram?.offEvent?.("viewportChanged", resize);
      map.off("load", handleLoad);
      map.off("styledata", handleStyleData);
      map.off("moveend", handleMoveEnd);
      map.off("error", handleError);
      eventMarkersRef.current.forEach((marker) => marker.remove());
      eventMarkersRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    const relevantEvents = new Map(
      events
        .filter((event) => !category || event.category === category)
        .filter(hasCoordinates)
        .map((event) => [event.id, event])
    );

    eventMarkersRef.current.forEach((marker, eventId) => {
      if (!relevantEvents.has(eventId)) {
        marker.remove();
        eventMarkersRef.current.delete(eventId);
      }
    });

    relevantEvents.forEach((event, eventId) => {
      const existing = eventMarkersRef.current.get(eventId);
      if (existing) {
        existing.setLngLat([event.longitude as number, event.latitude as number]);
        const element = existing.getElement();
        element.textContent = getCategoryIcon(event.category);
        element.setAttribute("aria-label", event.title || "Встреча");
        element.onclick = () => onMarkerClickRef.current?.(event);
        return;
      }

      const element = createMeetMarkerElement(event);
      element.onclick = () => onMarkerClickRef.current?.(event);
      const marker = new maplibregl.Marker({ element, anchor: "bottom" })
        .setLngLat([event.longitude as number, event.latitude as number])
        .addTo(map);
      eventMarkersRef.current.set(eventId, marker);
    });
  }, [category, events, loaded]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => mapRef.current?.zoomIn(),
    zoomOut: () => mapRef.current?.zoomOut(),
    flyToUser: () => locateUser(mapRef.current, userMarkerRef, showError),
  }), [showError]);

  return (
    <div style={{width:"100%",height:"100%",position:"relative",background:"var(--surface-secondary)"}}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {!loaded && !mapError && <div style={statusStyle}>Загрузка карты…</div>}
      {mapError && <div style={statusStyle}>Не удалось загрузить карту</div>}
      {mode === "create" && (
        <div style={centerMarkerStyle} aria-hidden="true">📍</div>
      )}
    </div>
  );
});

function hasCoordinates(event: MeetEvent) {
  return Number.isFinite(event.longitude) && Number.isFinite(event.latitude);
}

function readSavedLocation(): Coordinates | null {
  try {
    const raw = localStorage.getItem("aura_last_location");
    if (!raw) return null;
    const value = JSON.parse(raw);
    return Number.isFinite(value.lat) && Number.isFinite(value.lng) ? value : null;
  } catch {
    return null;
  }
}

function createMeetMarkerElement(event: MeetEvent) {
  const element = document.createElement("button");
  element.type = "button";
  element.setAttribute("aria-label", event.title || "Встреча");
  element.textContent = getCategoryIcon(event.category);
  Object.assign(element.style, {
    width: "46px", height: "46px", padding: "0", borderRadius: "50%",
    background: "rgba(255,255,255,.96)", display: "grid", placeItems: "center",
    border: "2px solid rgba(47,128,255,.18)", boxShadow: "0 12px 28px rgba(0,0,0,.22)",
    backdropFilter: "blur(10px)", cursor: "pointer", fontSize: "24px",
  });
  return element;
}

function getCategoryIcon(category: string) {
  return MEET_CATEGORIES.find((item) => item.id === category)?.icon || "📍";
}

function containsEmptyString(value: unknown): boolean {
  if (value === "") return true;
  return Array.isArray(value) && value.some(containsEmptyString);
}

function replaceEmptyStrings(value: unknown): unknown {
  if (value === "") return "dot";
  return Array.isArray(value) ? value.map(replaceEmptyStrings) : value;
}

async function locateUser(
  map: maplibregl.Map | null,
  markerRef: React.MutableRefObject<maplibregl.Marker | null>,
  showError: (title: string, text: string) => void
): Promise<Coordinates | null> {
  if (!map || !navigator.geolocation) {
    showError("Геолокация недоступна", "Ваше устройство не поддерживает геолокацию.");
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const coordinates = { lat: position.coords.latitude, lng: position.coords.longitude };
      localStorage.setItem("aura_last_location", JSON.stringify(coordinates));
      if (!markerRef.current) {
        const element = document.createElement("div");
        element.style.cssText = "width:18px;height:18px;border-radius:50%;background:var(--brand-primary);border:4px solid white;box-shadow:0 3px 12px rgba(47,128,255,.45)";
        markerRef.current = new maplibregl.Marker({ element }).setLngLat([coordinates.lng, coordinates.lat]).addTo(map);
      } else {
        markerRef.current.setLngLat([coordinates.lng, coordinates.lat]);
      }
      map.flyTo({ center: [coordinates.lng, coordinates.lat], zoom: 16 });
      resolve(coordinates);
    }, (error) => {
      const denied = error.code === error.PERMISSION_DENIED;
      showError(
        denied ? "Нет доступа к геолокации" : "Не удалось определить местоположение",
        denied ? "Разрешите доступ к геолокации в настройках Telegram." : "Проверьте GPS и попробуйте ещё раз."
      );
      resolve(null);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 });
  });
}

const centerMarkerStyle = { position: "absolute" as const, left: "50%", top: "50%", transform: "translate(-50%, -100%)", fontSize: 42, pointerEvents: "none" as const, zIndex: 15 };
const statusStyle = {position:"absolute" as const,inset:0,display:"grid",placeItems:"center",background:"var(--surface-secondary)",color:"var(--text-secondary)",fontSize:14,fontWeight:600,zIndex:5};

export default AuraMap;
