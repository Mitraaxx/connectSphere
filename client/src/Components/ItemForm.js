import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useItems } from '../Context/ItemContext';
import './ItemForm.css';

// --- ICONS ---
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const UploadIcon = ({ color = "#333" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 8 12 3 7 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ItemForm = ({ onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const { addItem } = useItems();
    const [location, setLocation] = useState({ address: '', lat: null, lng: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSelectionMade, setIsSelectionMade] = useState(false);
    const [locationInputName] = useState(`location-${Math.random().toString(36).substring(7)}`);

    useEffect(() => {
        if (isSelectionMade) {
            setIsSelectionMade(false);
            return;
        }

        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        if (location.address && searchQuery === location.address) {
            setSearchResults([]);
            return;
        }

        const handler = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`)
                .then(response => response.json())
                .then(data => setSearchResults(data))
                .catch(error => console.error("Error fetching location data:", error));
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, isSelectionMade, location.address]);

    const handleLocationSelect = (result) => {
        setLocation({
            address: result.display_name,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
        });
        
        setIsSelectionMade(true); 
        setSearchQuery(result.display_name);
        setSearchResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !description || !imageFile || !location.address) {
            toast.error("Please fill all fields, including location, and upload an image.");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('imageUrl', imageFile);
        formData.append('location', JSON.stringify(location));
        
        try {
            await addItem(formData);
            toast.success("Resource added successfully!");
            onClose();
        } catch (error) {
            toast.error("Failed to add resource. Please try again.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="item-form-container" onClick={(e) => e.stopPropagation()}>
                <button className="form-close-button" onClick={onClose}><CloseIcon /></button>
                <form onSubmit={handleSubmit} className="item-form" autoComplete="off">
                    <h2 className="form-title">Add New Resource</h2>
                    <div className="input-group">
                        <label className="styled-label" htmlFor="itemName">Resource Name</label>
                        <input id="itemName" className="styled-input-form" type="text" value={name} onChange={(e) => setName(e.target.value)} required/>
                    </div>
                    <div className="input-group">
                        <label className="styled-label" htmlFor={locationInputName}>Location</label>
                        <div className="location-input-wrapper">
                            <input 
                                id={locationInputName}
                                name={locationInputName}
                                className="styled-input-form"
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                                required
                            />
                            {searchResults.length > 0 && (
                                <div className="search-results-container">
                                    {searchResults.map(result => (
                                        <div 
                                            key={result.place_id} 
                                            className="search-result-item"
                                            onClick={() => handleLocationSelect(result)}
                                        >
                                            {result.display_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="styled-label" htmlFor="itemDescription">Description</label>
                        <textarea id="itemDescription" className="styled-textarea" value={description} onChange={(e) => setDescription(e.target.value)} required/>
                    </div>
                    <div className="input-group">
                        <label className="styled-label" htmlFor="file-upload">Cover Image</label>
                        <div>
                            <label htmlFor="file-upload" className="file-input-label">
                                <UploadIcon color="#333" />
                                {imageFile ? "Change Image" : "Select an Image"}
                            </label>
                            <input id="file-upload" className="hidden-file-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!imageFile} />
                            {imageFile && <span className="file-name">{imageFile.name}</span>}
                        </div>
                    </div>
                    <button type="submit" className="styled-button-form">
                        Submit Resource
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;
