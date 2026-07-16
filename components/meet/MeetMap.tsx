"use client";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents
} from "react-leaflet";

import { useState } from "react";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25,41],
  iconAnchor: [12,41]
});

function ClickMarker(){

  const [position,setPosition] =
    useState<[number,number] | null>(null);

  useMapEvents({

    click(e){

      setPosition([
        e.latlng.lat,
        e.latlng.lng
      ]);

    }

  });

  if(!position) return null;

  return (
    <Marker
      position={position}
      icon={icon}
    />
  );

}

export default function MeetMap(){

  return(

    <MapContainer

      center={[53.9,27.5667]}

      zoom={13}

      style={{
        width:"100%",
        height:"100%",
        borderRadius:20
      }}

    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickMarker/>

    </MapContainer>

  );

}