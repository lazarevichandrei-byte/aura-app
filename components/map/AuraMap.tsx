"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLE } from "../../lib/map/styles";

export default function AuraMap() {

  const mapContainer =
    useRef<HTMLDivElement>(null);

  const map =
    useRef<maplibregl.Map | null>(null);

  useEffect(() => {

    if (!mapContainer.current) return;

    if (map.current) return;



   

    

    return ()=>{

      map.current?.remove();

      map.current=null;

    };

  },[]);

  return(

    <div

      ref={mapContainer}

      style={{

        width:"100%",

        height:"100%",

        borderRadius:22,

        overflow:"hidden"

      }}

    />

  );

}