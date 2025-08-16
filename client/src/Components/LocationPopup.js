import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPopup.css';

// --- FIX for default Leaflet icon issue ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- ICON ---
const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const LocationPopup = ({ location, onClose }) => {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return null;
    }
    const position = [location.lat, location.lng];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="location-popup-container" onClick={(e) => e.stopPropagation()}>
                <button className="location-close-button" onClick={onClose}><CloseIcon /></button>
                <h3 className="address-title">{location.address}</h3>
                
                <div className="map-wrapper">
                    <MapContainer center={position} zoom={14} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position}>
                            <Popup>{location.address}</Popup>
                        </Marker>
                    </MapContainer>
                </div>

            </div>
        </div>
    );
};

export default LocationPopup;