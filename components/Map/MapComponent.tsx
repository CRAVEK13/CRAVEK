"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "./LocationPicker.module.css";

// Fix for default marker icons in React Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type LocationData = {
  lat: number;
  lng: number;
  address?: {
    addressLine1: string;
    city: string;
  };
};

type MapComponentProps = {
  onLocationSelect: (data: LocationData) => void;
  defaultLocation?: { lat: number; lng: number };
};

export default function MapComponent({ onLocationSelect, defaultLocation }: MapComponentProps) {
  // Default to Colombo
  const colomboCenter = { lat: 6.9271, lng: 79.8612 };
  const initialCenter = defaultLocation || colomboCenter;
  
  const [position, setPosition] = useState<{ lat: number; lng: number }>(initialCenter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const markerRef = useRef<L.Marker>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      
      const addressParts = [];
      if (data.address.road) addressParts.push(data.address.road);
      if (data.address.suburb) addressParts.push(data.address.suburb);
      
      const addressLine1 = addressParts.join(", ") || data.name || "";
      const city = data.address.city || data.address.town || data.address.village || data.address.county || "Colombo";
      
      onLocationSelect({
        lat,
        lng,
        address: {
          addressLine1,
          city
        }
      });
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      // Still pass the coordinates even if reverse geocoding fails
      onLocationSelect({ lat, lng });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationFound = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        handleLocationFound(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          handleLocationFound(newPos.lat, newPos.lng);
        }
      },
    }),
    []
  );

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleLocationFound(lat, lng);
      },
      (err) => {
        setError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <span className={styles.status}>
          {loading ? "Fetching location..." : error ? <span style={{color: "red"}}>{error}</span> : "Click or drag the marker to set your location"}
        </span>
        <button 
          type="button" 
          onClick={getUserLocation} 
          className={styles.btn}
          disabled={loading}
        >
          📍 Get My Location
        </button>
      </div>
      <div className={styles.mapWrapper}>
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
          >
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
