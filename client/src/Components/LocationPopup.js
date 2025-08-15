import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- FIX for default Leaflet icon issue with webpack ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- ICONS ---
const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// --- STYLED COMPONENTS (iOS Theme) ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1050;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  @keyframes fadeIn { to { opacity: 1; } }
`;

const PopupContainer = styled.div`
  width: 90%;
  max-width: 600px;
  background: rgba(242, 242, 247, 0.85);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  padding: 20px;
  transform: scale(0.95);
  animation: scaleUp 0.3s forwards;
  @keyframes scaleUp { to { transform: scale(1); } }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px; right: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: none; cursor: pointer;
  width: 28px; height: 28px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
  &:hover {
    background-color: rgba(0,0,0,0.5);
  }
`;

const AddressTitle = styled.h3`
  color: #1c1c1e;
  text-align: center;
  margin: 0 0 15px;
  font-size: 1.2rem;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 0 30px;
`;

const MapWrapper = styled.div`
  height: 400px;
  width: 100%;
  border-radius: 15px;
  overflow: hidden;
  .leaflet-container {
    height: 100%;
    width: 100%;
  }
`;

// --- REACT COMPONENT ---
const LocationPopup = ({ location, onClose }) => {
    const position = [location.lat, location.lng];

    return (
        <ModalOverlay onClick={onClose}>
            <PopupContainer onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}><CloseIcon /></CloseButton>
                <AddressTitle>{location.address}</AddressTitle>
                
                <MapWrapper>
                    <MapContainer center={position} zoom={14} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position}>
                            <Popup>{location.address}</Popup>
                        </Marker>
                    </MapContainer>
                </MapWrapper>

            </PopupContainer>
        </ModalOverlay>
    );
};

export default LocationPopup;
