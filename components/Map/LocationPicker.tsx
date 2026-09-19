"use client";

import dynamic from "next/dynamic";
import styles from "./LocationPicker.module.css";

// Dynamically import the map component with SSR disabled
// Leaflet uses the window object, which is not available during Server Side Rendering
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className={styles.container}>
      <div className={styles.mapWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
        Loading map...
      </div>
    </div>
  ),
});

type LocationData = {
  lat: number;
  lng: number;
  address?: {
    addressLine1: string;
    city: string;
  };
};

type LocationPickerProps = {
  onLocationSelect: (data: LocationData) => void;
  defaultLocation?: { lat: number; lng: number };
};

export default function LocationPicker({ onLocationSelect, defaultLocation }: LocationPickerProps) {
  return <MapComponent onLocationSelect={onLocationSelect} defaultLocation={defaultLocation} />;
}
