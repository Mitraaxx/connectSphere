import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import toast from 'react-hot-toast';
import { useItems } from '../Context/ItemContext';

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

// --- STYLED COMPONENTS ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  @keyframes fadeIn { to { opacity: 1; } }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 320px;
  padding: 20px 25px;
  background: rgba(249, 249, 249, 0.65);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  transform: scale(0.95);
  animation: scaleUp 0.3s forwards;
  @keyframes scaleUp { to { transform: scale(1); } }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px; right: 15px;
  background: transparent; border: none; cursor: pointer;
  padding: 5px; border-radius: 50%;
  transition: background-color 0.2s;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit; /* FIX: Inherit global font */
  &:hover {
    background-color: rgba(0,0,0,0.1);
  }
`;

const Title = styled.h2`
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 1.2rem;
  font-size: 1.4rem;
  font-weight: 50;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const LocationInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledLabel = styled.label`
  color: #333;
  font-size: 0.8rem;
  font-weight: 500;
  padding-left: 5px;
`;

const sharedInputStyles = css`
  width: 100%;
  padding: 12px;
  font-size: 0.9rem;
  border-radius: 12px;
  box-sizing: border-box;
  border: 1px solid transparent;
  background-color: rgba(228, 228, 229, 0.5);
  color: #1c1c1e;
  transition: all 0.2s ease-in-out;
  
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &::placeholder { color: #8e8e93; }
  &:focus {
    outline: none;
    background-color: white;
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StyledInput = styled.input`${sharedInputStyles}`;
const StyledTextarea = styled.textarea`${sharedInputStyles} resize: vertical; min-height: 70px; white-space: normal;`;

const sharedButtonSizing = css`
  width: 100%; padding: 12px;
  font-size: 0.95rem;
   border-radius: 12px;
  box-sizing: border-box; border: 1px solid transparent;
  display: flex; align-items: center; justify-content: center;
  gap: 10px; cursor: pointer; transition: all 0.2s ease-in-out;
`;

const FileInputLabel = styled.label`${sharedButtonSizing} background-color: rgba(0, 0, 0, 0.05); color: #000;  &:hover { background-color: rgba(0, 0, 0, 0.1); }`;
const HiddenFileInput = styled.input`display: none;`;
const FileName = styled.span`display: block; text-align: center; margin-top: 0.5rem; font-size: 0.8rem; color: #333; word-break: break-all;`;

const spin = keyframes`to { transform: rotate(360deg); }`;
const LoadingSpinner = styled.div`border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; border-top-color: #fff; width: 20px; height: 20px; animation: ${spin} 1s ease-in-out infinite;`;

const StyledButton = styled.button`${sharedButtonSizing} 
  background-color: #000; 
  color: #fff; 
 
  margin-top: 5px; 
  font-family: inherit; /* FIX: Inherit global font */
  &:hover:not(:disabled) { background-color: #333; transform: translateY(-2px); } 
  &:disabled { background-color: #888; cursor: not-allowed; }`;

const SearchResultsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1050;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const SearchResultItem = styled.div`
  padding: 10px 15px;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f2f2f7;
  }
`;

// --- REACT COMPONENT ---
const ItemForm = ({ onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
        // --- ✨ UPDATED VALIDATION ---
        if (!name || !description || !imageFile || !location.address) {
            toast.error("Please fill all fields, including location, and upload an image.");
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('imageUrl', imageFile);
        
        // Location is now mandatory, so we always append it.
        formData.append('location', JSON.stringify(location));
        
        try {
            await addItem(formData);
            toast.success("Resource added successfully!");
            onClose();
        } catch (error) {
            toast.error("Failed to add resource. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <FormContainer onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}><CloseIcon /></CloseButton>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} autoComplete="off">
                    <Title>Add New Resource</Title>
                    <InputGroup>
                        <StyledLabel htmlFor="itemName">Resource Name</StyledLabel>
                        {/* --- ✨ ADDED REQUIRED ATTRIBUTE --- */}
                        <StyledInput id="itemName" type="text" placeholder="" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} required/>
                    </InputGroup>
                    <InputGroup>
                        <StyledLabel htmlFor={locationInputName}>Location</StyledLabel>
                        <LocationInputWrapper>
                             {/* --- ✨ ADDED REQUIRED ATTRIBUTE --- */}
                            <StyledInput 
                                id={locationInputName}
                                name={locationInputName}
                                type="text" 
                                placeholder="" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                                disabled={isLoading}
                                required
                            />
                            {searchResults.length > 0 && (
                                <SearchResultsContainer>
                                    {searchResults.map(result => (
                                        <SearchResultItem 
                                            key={result.place_id} 
                                            onClick={() => handleLocationSelect(result)}
                                        >
                                            {result.display_name}
                                        </SearchResultItem>
                                    ))}
                                </SearchResultsContainer>
                            )}
                        </LocationInputWrapper>
                    </InputGroup>
                    <InputGroup>
                        <StyledLabel htmlFor="itemDescription">Description</StyledLabel>
                         {/* --- ✨ ADDED REQUIRED ATTRIBUTE --- */}
                        <StyledTextarea id="itemDescription" placeholder="" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} required/>
                    </InputGroup>
                    <InputGroup>
                        <StyledLabel htmlFor="file-upload">Cover Image</StyledLabel>
                        <div>
                            <FileInputLabel htmlFor="file-upload">
                                <UploadIcon color="#333" />
                                {imageFile ? "Change Image" : "Select an Image"}
                            </FileInputLabel>
                             {/* --- ✨ ADDED REQUIRED ATTRIBUTE --- */}
                            <HiddenFileInput id="file-upload" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} disabled={isLoading} required={!imageFile} />
                            {imageFile && <FileName>{imageFile.name}</FileName>}
                        </div>
                    </InputGroup>
                    <StyledButton type="submit" disabled={isLoading}>
                        {isLoading ? <LoadingSpinner /> : 'Submit Resource'}
                    </StyledButton>
                </form>
            </FormContainer>
        </ModalOverlay>
    );
};

export default ItemForm;
