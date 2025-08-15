import React, { useState } from 'react';
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
  backdrop-filter: blur(8px); /* Kept blur as requested */
  -webkit-backdrop-filter: blur(8px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  @keyframes fadeIn { to { opacity: 1; } }
`;

// --- ✨ Theme Update: Matched container to homepage style ---
const FormContainer = styled.div`
  width: 100%;
  max-width: 380px; /* Kept size as requested */
  padding: 30px 35px;
  background: rgba(249, 249, 249, 0.65); /* Lighter, cleaner glass effect */
  border-radius: 20px; /* Softer radius */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1); /* Softer shadow */
  backdrop-filter: blur(5px); /* Kept blur as requested */
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  transform: scale(0.95);
  animation: scaleUp 0.3s forwards;
  @keyframes scaleUp { to { transform: scale(1); } }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px; right: 20px;
  background: transparent; border: none; cursor: pointer;
  padding: 5px; border-radius: 50%;
  transition: background-color 0.2s, transform 0.2s;
  display: flex; align-items: center; justify-content: center;
  &:hover {
    background-color: rgba(0,0,0,0.1);
  }
`;

const Title = styled.h2`
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 1.8rem;
  font-size: 1.7rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif; /* ✨ Matched font to theme */
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const StyledLabel = styled.label`
  color: #333;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif; /* ✨ Matched font to theme */
  padding-left: 5px;
`;

// --- ✨ Theme Update: A single style for all input fields for consistency ---
const sharedInputStyles = css`
  width: 100%;
  padding: 14px;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif; /* ✨ Matched font to theme */
  border-radius: 12px;
  box-sizing: border-box;
  border: 1px solid transparent;
  background-color: rgba(228, 228, 229, 0.5); /* ✨ iOS-style input background */
  color: #1c1c1e;
  transition: all 0.2s ease-in-out;

  &::placeholder {
    color: #8e8e93; /* ✨ iOS-style placeholder color */
  }

  &:focus {
    outline: none;
    background-color: white;
    border-color: rgba(0, 0, 0, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StyledInput = styled.input`
  ${sharedInputStyles}
`;

const StyledTextarea = styled.textarea`
  ${sharedInputStyles}
  resize: vertical;
  min-height: 90px;
`;

// --- ✨ Theme Update: Shared styles for button sizing ---
const sharedButtonSizing = css`
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  border-radius: 12px;
  box-sizing: border-box;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
`;

const FileInputLabel = styled.label`
  ${sharedButtonSizing}
  background-color: rgba(0, 0, 0, 0.05); /* Matched secondary button style */
  color: #000;
  font-weight: 600;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileName = styled.span`
  display: block; text-align: center;
  margin-top: 0.5rem; font-size: 0.8rem;
  color: #333; font-family: 'Inter', sans-serif;
  word-break: break-all;
`;

const spin = keyframes`to { transform: rotate(360deg); }`;
const LoadingSpinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%; border-top-color: #fff;
  width: 20px; height: 20px;
  animation: ${spin} 1s ease-in-out infinite;
`;

const StyledButton = styled.button`
  ${sharedButtonSizing}
  background-color: #000; /* Matched primary button style */
  color: #fff;
  font-weight: 600;
  margin-top: 5px;

  &:hover:not(:disabled) {
    background-color: #333;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #888;
    cursor: not-allowed;
  }
`;

// --- REACT COMPONENT ---
const ItemForm = ({ onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { addItem } = useItems();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !description || !imageFile) {
            toast.error("Please fill all fields and upload an image.");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('imageUrl', imageFile);

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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <Title>Add New Resource</Title>

                    <InputGroup>
                        <StyledLabel htmlFor="itemName">Resource Name</StyledLabel>
                        <StyledInput id="itemName" type="text" placeholder="e.g., React Design Patterns" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading}/>
                    </InputGroup>

                    <InputGroup>
                        <StyledLabel htmlFor="itemDescription">Description</StyledLabel>
                        <StyledTextarea id="itemDescription" placeholder="A short summary..." value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading}/>
                    </InputGroup>

                    <InputGroup>
                        <StyledLabel htmlFor="file-upload">Cover Image</StyledLabel>
                        <div>
                            <FileInputLabel htmlFor="file-upload">
                                <UploadIcon color="#333" />
                                {imageFile ? "Change Image" : "Select an Image"}
                            </FileInputLabel>
                            <HiddenFileInput id="file-upload" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} disabled={isLoading}/>
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