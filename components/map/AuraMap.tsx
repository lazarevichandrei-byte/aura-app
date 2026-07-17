"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLE } from "../../lib/map/styles";

type Props = {
  onCenterChanged?: (
    lat: number,
    lng: number
  ) => void;
};

export default function AuraMap({
  onCenterChanged
}: Props) {

  const mapContainer =
    useRef<HTMLDivElement>(null);

  const map =
    useRef<maplibregl.Map | null>(null);

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

  </div>

);

}