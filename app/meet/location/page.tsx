"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../../components/PageWrapper";
import AuraMap, { type AuraMapRef } from "../../../components/map/AuraMap";
import MapControls from "../../../components/map/MapControls";
import PlaceBottomCard from "../../../components/map/PlaceBottomCard";
import { reverseGeocode } from "../../../lib/map/reverseGeocode";
import { consumeInitialMeetLocation, saveMeetLocation, saveProfileLocation } from "../../../lib/meet/locationStore";
import { useNotification } from "../../../components/NotificationContext";
import { DEFAULT_CENTER } from "../../../lib/map/map";
import {useI18n} from "../../../components/I18nProvider";

export default function MeetLocationPage() {
  const router = useRouter();
  const { error: showError } = useNotification();
  const {t}=useI18n();
  const mapRef = useRef<AuraMapRef>(null);
  const initialLocationRef = useRef(
    typeof window === "undefined" ? null : consumeInitialMeetLocation()
  );
  const requestSequenceRef = useRef(0);
  const profileModeRef=useRef(typeof window!=="undefined"&&new URLSearchParams(window.location.search).get("source")==="profile");
  const [center, setCenter] = useState(() => initialLocationRef.current
    ? { lat: initialLocationRef.current.lat, lng: initialLocationRef.current.lng }
    : DEFAULT_CENTER);
  const [place, setPlace] = useState({
    title: initialLocationRef.current?.title || "",
    address: initialLocationRef.current?.address || "",
    city: initialLocationRef.current?.city || "",
  });

  useEffect(() => {
    const controller = new AbortController();
    const sequence = ++requestSequenceRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const result = await reverseGeocode(center.lat, center.lng, controller.signal);
        if (sequence === requestSequenceRef.current) setPlace(result);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("REVERSE GEOCODING ERROR:", error);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [center]);

  const selectPlace = () => {
    if (!place.title && !place.address) {
      showError(t("map.addressPending"), t("map.addressPendingHint"));
      return;
    }
    const location={ ...place, lat: center.lat, lng: center.lng };
    if(profileModeRef.current)saveProfileLocation(location);else saveMeetLocation(location);
    router.back();
  };

  return (
    <PageWrapper enabled={false}>
      <div style={pageStyle}>
        <AuraMap
          ref={mapRef}
          initialCenter={initialLocationRef.current ? {
            lat: initialLocationRef.current.lat,
            lng: initialLocationRef.current.lng,
          } : null}
          onCenterChanged={(lat, lng) => setCenter({ lat, lng })}
        />

        <MapControls
          onLocation={() => {
            void mapRef.current?.flyToUser().then((coordinates) => {
              if (coordinates) setCenter(coordinates);
            });
          }}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />

        <PlaceBottomCard title={place.title} address={place.address} onSelect={selectPlace} />

        <header style={headerStyle}>
          <button type="button" onClick={() => router.back()} aria-label={t("common.back")} style={backButtonStyle}>
            <ArrowLeft2 size="22" color="var(--brand-primary)" />
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{t(profileModeRef.current?"location.chooseManually":"map.where")}</div>
            <div style={{ marginTop: 3, color: "var(--text-secondary)", fontSize: 12 }}>{t("map.whereHint")}</div>
          </div>
        </header>
      </div>
    </PageWrapper>
  );
}

const pageStyle = {
  position: "relative" as const,
  width: "100%",
  height: "var(--tg-viewport-stable-height, 100dvh)",
  overflow: "hidden",
  background: "var(--app-bg)",
  "--aura-map-card-clearance": "176px",
};

const headerStyle = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  zIndex: 20,
  padding: "max(8px, env(safe-area-inset-top, 0px)) 16px 8px",
  display: "flex",
  alignItems: "center",
  gap: 14,
  pointerEvents: "none" as const,
};

const backButtonStyle = {
  width: 40,
  height: 40,
  padding: 0,
  border: 0,
  borderRadius: 20,
  background: "var(--surface)",
  color:"var(--text-primary)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,.08)",
  pointerEvents: "auto" as const,
};
