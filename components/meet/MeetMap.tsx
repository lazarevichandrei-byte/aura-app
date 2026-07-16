"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MeetMap() {

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    if (!mapRef.current) return;

    const map = new maplibregl.Map({

      container: mapRef.current,

      style: "https://demotiles.maplibre.org/style.json",

      center: [27.5667,53.9],

      zoom: 12

    });

    map.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

    return () => map.remove();

  }, []);

  return (

    <div

      ref={mapRef}

      style={{

        width:"100%",

        height:"100%",

        borderRadius:20,

        overflow:"hidden"

      }}

    />

  );

}