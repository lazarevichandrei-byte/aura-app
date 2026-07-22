"use client";

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLE } from "../../lib/map/styles";
import type { MeetEvent } from "../../lib/meet/types";
import { loadMeetEvents } from "../../lib/meet/api";
import { MEET_CATEGORIES } from "../../lib/meet/categories";

type Props = {
  mode?: "create" | "view";

  onCenterChanged?: (
    lat: number,
    lng: number
  ) => void;

  onMarkerClick?: (
    event: MeetEvent
  ) => void;

  category?: string | null;

  selectedEvent?: MeetEvent | null;
};

export type AuraMapRef = {
  zoomIn: () => void;
  zoomOut: () => void;
  flyToUser: () => void;
};

const AuraMap = forwardRef<AuraMapRef, Props>(({
  mode = "create",
  onCenterChanged,
  onMarkerClick,
  category,
  selectedEvent
}, ref) => {

  const mapContainer =
    useRef<HTMLDivElement>(null);

  const map =
    useRef<maplibregl.Map | null>(null);

    const markers =
  useRef<maplibregl.Marker[]>([]);

const markerElements =
  useRef<Map<string, HTMLDivElement>>(new Map());

const events =
  useRef<MeetEvent[]>([]);

  function renderMarkers() {

  if (!map.current) return;

  markers.current.forEach(marker => marker.remove());

markers.current = [];

markerElements.current.clear();

  for (const event of events.current) {

  if (
    category &&
    event.category !== category
  ) {
    continue;
  }

    const el = document.createElement("div");

    const meetCategory = MEET_CATEGORIES.find(
  c => c.id === event.category
);

const icon = meetCategory?.icon ?? "📍";


el.style.width = "46px";
el.style.height = "46px";


el.style.width = "46px";

el.style.height = "46px";

el.style.borderRadius = "50%";

el.style.background =
  "rgba(255,255,255,.96)";

el.style.display = "flex";
el.style.alignItems = "center";
el.style.justifyContent = "center";

el.style.border =
  "2px solid rgba(47,128,255,.18)";

el.style.boxShadow =
  "0 12px 28px rgba(0,0,0,.22)";

el.style.backdropFilter =
  "blur(10px)";

el.style.transition =
  "transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease";

el.style.cursor = "pointer";



el.innerHTML = `
<span style="font-size:24px">
${icon}
</span>
`;

el.onclick = () => {

  if (map.current) {

    map.current.flyTo({

      center: [
        event.longitude,
        event.latitude - 0.0012
      ],

      duration: 700,

      essential: true

    });

  }

  setTimeout(() => {

    onMarkerClick?.(event);

  }, 220);

};

el.onmouseenter = () => {

  el.style.transform = "scale(1.08)";

  el.style.boxShadow =
    "0 18px 34px rgba(0,0,0,.28)";
};

el.onmouseleave = () => {

  if (
    selectedEvent?.id === event.id
  ) {
    return;
  }

  el.style.transform = "scale(1)";

  el.style.boxShadow =
    "0 12px 28px rgba(0,0,0,.22)";
};

el.innerHTML = `
<span style="font-size:24px">
${icon}
</span>
`;


markerElements.current.set(event.id, el);

    const marker = new maplibregl.Marker({
      element: el,
      anchor: "bottom"
    })
      .setLngLat([
        event.longitude,
        event.latitude
      ])
      .addTo(map.current);

    markers.current.push(marker);

  }

}

  useEffect(() => {



    if (!mapContainer.current) return;

    if (map.current) return;



 

    map.current =
      new maplibregl.Map({

        container: mapContainer.current,

        style: MAP_STYLE({
  key: process.env.NEXT_PUBLIC_MAPTILER_KEY!
}),

        center: [27.5615,53.9023],

        zoom: 12,

        attributionControl:false

      });

      map.current.on("moveend", () => {

  if (!map.current) return;

  const center = map.current.getCenter();

  onCenterChanged?.(
    center.lat,
    center.lng
  );

});

map.current.on("load", () => {

  const saved = localStorage.getItem("aura_last_location");

if (saved) {
  return;
}

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(

    (pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      localStorage.setItem(
        "aura_last_location",
        JSON.stringify({ lat, lng })
      );

     map.current?.setCenter([
  lng,
  lat
]);

map.current?.setZoom(16);

    },

    () => {},

    {

      enableHighAccuracy: true,

      timeout: 10000,

      maximumAge: 0

    }

  );

});

    



    

    return ()=>{

      map.current?.remove();

      map.current=null;

    };

  },[]);

  useImperativeHandle(ref, () => ({

  zoomIn() {
    map.current?.zoomIn();
  },

  zoomOut() {
    map.current?.zoomOut();
  },

  flyToUser() {
  if (!navigator.geolocation) {
    alert("Геолокация не поддерживается");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      map.current?.flyTo({
        center: [
          pos.coords.longitude,
          pos.coords.latitude,
        ],
        zoom: 16,
      });
    },
    (error) => {
      console.error(error);
      alert("Не удалось определить местоположение.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

}));


useEffect(() => {

  async function load() {

    try {

      events.current = await loadMeetEvents();

      renderMarkers();

      console.log(
        "Loaded meet events:",
        events.current
      );

    } catch (e) {

      console.error(
        "Load meet events error:",
        e
      );

    }

  }

  load();

}, [onCenterChanged]);

useEffect(() => {
  renderMarkers();
}, [category]);





  return (

  <div
    style={{
      width: "100%",
      height: "100%",
      position: "relative"
    }}
  >

    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%"
      }}
    />

   {mode === "create" && (

  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -100%)",
      fontSize: 42,
      pointerEvents: "none",
      zIndex: 15
    }}
  >
    📍
  </div>

)}

  </div>

);

});

export default AuraMap;