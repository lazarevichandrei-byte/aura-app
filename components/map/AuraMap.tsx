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
};

export type AuraMapRef = {
  zoomIn: () => void;
  zoomOut: () => void;
  flyToUser: () => void;
};

const AuraMap = forwardRef<AuraMapRef, Props>(({
  mode = "create",
  onCenterChanged,
  onMarkerClick
}, ref) => {

  const mapContainer =
    useRef<HTMLDivElement>(null);

  const map =
    useRef<maplibregl.Map | null>(null);

    const markers =
  useRef<maplibregl.Marker[]>([]);

const events =
  useRef<MeetEvent[]>([]);

  function renderMarkers() {

  if (!map.current) return;

  markers.current.forEach(marker => marker.remove());
  markers.current = [];

  for (const event of events.current) {

    if (
      event.latitude == null ||
      event.longitude == null
    ) {
      continue;
    }

    const el = document.createElement("div");

    el.innerHTML = "📍";

    el.style.fontSize = "34px";
    el.style.cursor = "pointer";

    el.onclick = () => {

  onMarkerClick?.(event);

};

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

    navigator.geolocation.getCurrentPosition((pos) => {

      map.current?.flyTo({

        center: [
          pos.coords.longitude,
          pos.coords.latitude
        ],

        zoom: 16

      });

    });

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

}, []);



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