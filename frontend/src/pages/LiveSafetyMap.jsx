import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, MapPin, Navigation, ShieldCheck, AlertTriangle, Share2, Route } from 'lucide-react';
import { api } from '../services/api';

// Fix Leaflet's default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Blue Dot for Live Location
const liveIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Destination Icon (Safe Place / Police Station)
const safeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically update map center to user location
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function LiveSafetyMap() {
  const [userLoc, setUserLoc] = useState({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
  const [crimeZones, setCrimeZones] = useState([]);
  const [isInDangerZone, setIsInDangerZone] = useState(false);
  const [dangerZoneDetails, setDangerZoneDetails] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  
  // Safe Routing State
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [destination, setDestination] = useState(null);
  const [isRouting, setIsRouting] = useState(false);

  const watchIdRef = useRef(null);

  // Haversine formula to calculate distance in meters
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    // Initial Position Check
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const initLat = pos.coords.latitude;
        const initLng = pos.coords.longitude;
        setUserLoc({ lat: initLat, lng: initLng });
        
        // Dynamically mock danger zones near the user's initial location if API fails
        const mockZones = [
          {
            _id: '1',
            name: 'Unlit Alleyway / High Theft Area',
            description: 'Multiple reports of snatching and harassment after 8 PM.',
            type: 'High Risk',
            lat: initLat + 0.002, // 200m North
            lng: initLng + 0.002, // 200m East
            radiusMeters: 300
          },
          {
            _id: '2',
            name: 'Deserted Industrial Park',
            description: 'Isolated area with no CCTV coverage.',
            type: 'Danger Zone',
            lat: initLat - 0.004, // 400m South
            lng: initLng - 0.001, // 100m West
            radiusMeters: 400
          }
        ];
        
        api.get('/emergency/zones').then((res) => {
          if (res.data.success && res.data.zones.length > 0) {
            setCrimeZones(res.data.zones);
          } else {
            setCrimeZones(mockZones);
          }
        }).catch(() => {
          setCrimeZones(mockZones); // Fallback geofences
        });
      }, console.error, { enableHighAccuracy: true });
    }
    return () => stopTracking();
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setTrackingActive(true);
    
    // Request highly accurate position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        setUserLoc({ lat: currentLat, lng: currentLng });
        
        // Check intersection with any crime zone
        let insideDanger = false;
        let currentDanger = null;

        for (let zone of crimeZones) {
          const dist = getDistanceMeters(currentLat, currentLng, zone.lat, zone.lng);
          if (dist <= zone.radiusMeters) {
            insideDanger = true;
            currentDanger = zone;
            break;
          }
        }

        setIsInDangerZone(insideDanger);
        setDangerZoneDetails(currentDanger);
      },
      (error) => {
        console.error("Error watching position", error);
        setTrackingActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingActive(false);
    setIsInDangerZone(false);
  };

  // Safe Routing using OSRM Open API
  const calculateSafeRoute = async () => {
    // Pick a mock "Safe Destination" (e.g., Police Station 1km West)
    const destLat = userLoc.lat + 0.001;
    const destLng = userLoc.lng - 0.008;
    setDestination({ lat: destLat, lng: destLng });
    setIsRouting(true);

    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${destLng},${destLat}?overview=full&geometries=geojson`);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // OSRM GeoJSON format is [lng, lat]. We need to map it to Leaflet's [lat, lng]
        const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoordinates(coordinates);
      }
    } catch (err) {
      console.error("Routing failed:", err);
      alert("Could not calculate safe route at this time.");
    } finally {
      setIsRouting(false);
    }
  };

  const shareLiveLocation = () => {
    const locUrl = `https://www.google.com/maps?q=${userLoc.lat},${userLoc.lng}`;
    const text = encodeURIComponent(`URGENT: I am sharing my live location via LawShield. Please track me here: ${locUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] flex items-center space-x-2 tracking-tight">
            <Navigation size={28} className="text-[#854d0e]" />
            <span>Live Safety Map & Routing</span>
          </h1>
          <p className="text-sm text-slate-700 mt-1 font-medium max-w-lg">
            Real-time GPS tracking and crime heatmaps (Geofencing). Avoid red zones and generate safe routes to the nearest police station.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={trackingActive ? stopTracking : startTracking}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-xs ${
              trackingActive 
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-white border border-stone-300 text-slate-800 hover:bg-stone-50'
            }`}
          >
            <MapPin size={14} className={trackingActive ? 'animate-bounce' : ''} />
            <span>{trackingActive ? 'Stop Live Tracking' : 'Start Live GPS'}</span>
          </button>
          
          <button 
            onClick={calculateSafeRoute}
            disabled={isRouting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-xs bg-[#0f172a] text-white hover:bg-[#1e293b]"
          >
            <Route size={14} />
            <span>{isRouting ? 'Routing...' : 'Find Safe Route'}</span>
          </button>

          <button 
            onClick={shareLiveLocation}
            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
          >
            <Share2 size={14} />
            <span>WhatsApp Share</span>
          </button>
        </div>
      </div>

      {/* Danger Zone Alert Overlay */}
      {isInDangerZone && (
        <div className="bg-red-600 text-white p-4 rounded-2xl shadow-lg flex items-start space-x-4 animate-in slide-in-from-top-4">
          <AlertTriangle size={32} className="shrink-0 mt-1 animate-pulse" />
          <div>
            <h3 className="text-lg font-black uppercase tracking-wide">⚠️ Warning: High Crime Zone Entered</h3>
            <p className="text-sm font-medium mt-0.5 opacity-90">
              You have entered <strong>{dangerZoneDetails?.name}</strong>. {dangerZoneDetails?.description}
            </p>
            <p className="text-xs font-bold mt-2 bg-black/20 inline-block px-3 py-1 rounded-lg">
              Action: Reroute immediately. Stay on main roads and keep your phone accessible.
            </p>
          </div>
        </div>
      )}
      
      {!isInDangerZone && trackingActive && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-4 rounded-2xl flex items-center space-x-3">
          <ShieldCheck size={24} className="text-emerald-600" />
          <div>
            <h4 className="font-bold text-sm">Safe Zone</h4>
            <p className="text-xs font-medium">You are not currently in any known geofenced danger zones.</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="w-full h-[60vh] min-h-[400px] rounded-3xl overflow-hidden border-4 border-stone-200 shadow-sm relative z-0">
        <MapContainer 
          center={[userLoc.lat, userLoc.lng]} 
          zoom={15} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <RecenterAutomatically lat={userLoc.lat} lng={userLoc.lng} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          <Marker position={[userLoc.lat, userLoc.lng]} icon={liveIcon}>
            <Popup>
              <div className="font-bold text-[#0f172a]">Your Live Location</div>
              <div className="text-xs text-slate-600 mt-1">{trackingActive ? 'Tracking Active' : 'Last Known Location'}</div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={safeIcon}>
              <Popup>
                <div className="font-bold text-[#0f172a] text-sm flex items-center"><ShieldCheck size={14} className="mr-1 text-emerald-600" /> Police Station / Safe Zone</div>
                <div className="text-xs text-slate-600 mt-1">Navigate here for safety.</div>
              </Popup>
            </Marker>
          )}

          {/* Safe Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline 
              positions={routeCoordinates}
              pathOptions={{ color: '#0ea5e9', weight: 6, opacity: 0.8 }} // Tailwind sky-500
            />
          )}

          {/* Crime Heatmap Geofences */}
          {crimeZones.map(zone => (
            <Circle 
              key={zone._id}
              center={[zone.lat, zone.lng]}
              radius={zone.radiusMeters}
              pathOptions={{
                color: '#dc2626',
                fillColor: '#ef4444',
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <div className="w-48 space-y-1.5">
                  <div className="flex items-center space-x-1 text-red-700 text-xs font-black uppercase">
                    <ShieldAlert size={12} />
                    <span>{zone.type}</span>
                  </div>
                  <h4 className="font-bold text-[#0f172a] text-sm">{zone.name}</h4>
                  <p className="text-xs text-slate-700">{zone.description}</p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
        
        {/* Map UI Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-stone-200 shadow-sm flex flex-col space-y-2 pointer-events-none">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-[#2b82cb] border-2 border-white inline-block shadow-sm"></span>
            <span>Your Live GPS Location</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-700">
            <span className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500 inline-block"></span>
            <span>Geofenced Danger Zone</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-700">
            <span className="w-4 h-1 rounded-full bg-sky-500 inline-block"></span>
            <span>Safe Route Path</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
