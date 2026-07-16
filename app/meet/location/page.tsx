"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";

import PageWrapper from "../../../components/PageWrapper";

import AuraMap from "../../../components/map/AuraMap";
import MapSearch from "../../../components/map/MapSearch";
import MapCategories from "../../../components/map/MapCategories";
import MapControls from "../../../components/map/MapControls";
import PlaceBottomCard from "../../../components/map/PlaceBottomCard";
export default function MeetLocationPage() {

  const router = useRouter();

  const [search,setSearch] =
    useState("");

  return (

    <PageWrapper>

      <div
        style={{
          position:"relative",
          width:"100%",
          height:"100vh",
          overflow:"hidden",
          background:"#F5F7FB"
        }}
      >

        {/* КАРТА */}

        <div
          style={{
            position:"absolute",
            inset:0
          }}
        >

          <AuraMap/>

          <MapControls

  onLocation={()=>{}}

  onZoomIn={()=>{}}

  onZoomOut={()=>{}}

/>

<PlaceBottomCard/>

        </div>

        {/* HEADER */}

        <div
          style={{
            position:"absolute",
            top:0,
            left:0,
            right:0,
            zIndex:20,
            paddingTop:18
          }}
        >

          <div
            style={{
              display:"flex",
              alignItems:"center",
              gap:14,
              padding:"0 20px 12px"
            }}
          >

            <div

              onClick={()=>router.back()}

              style={{

                width:42,

                height:42,

                borderRadius:21,

                background:"#fff",

                display:"flex",

                justifyContent:"center",

                alignItems:"center",

                cursor:"pointer",

                boxShadow:
                  "0 6px 18px rgba(0,0,0,.08)"

              }}

            >

              <ArrowLeft2
                size="22"
                color="#2F80FF"
              />

            </div>

            <div>

              <div
                style={{
                  fontSize:22,
                  fontWeight:700,
                  color:"#111827"
                }}
              >
                Где пройдет встреча?
              </div>

              <div
                style={{
                  marginTop:3,
                  color:"#6B7280",
                  fontSize:13
                }}
              >
                Выберите место на карте
              </div>

            </div>

          </div>

          <MapSearch

            value={search}

            onChange={setSearch}

          />

          <MapCategories/>

        </div>

      </div>

    </PageWrapper>

  );

}