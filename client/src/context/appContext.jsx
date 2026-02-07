import { createContext, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [credits, setCredits] = useState(0);
    const [error, setError] = useState(null);
    
    const { getToken, isSignedIn } = useAuth();
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    // Fetch user credits
    const fetchCredits = async () => {
        try {
            if (!isSignedIn) return;
            
            const token = await getToken();
            const response = await axios.get(`${backendUrl}/api/bg-removal/credits`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setCredits(response.data.data.creditBalance);
            } else {
                console.error('Failed to fetch credits:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching credits:', error);
            // If bg-removal endpoint fails, try the user endpoint as fallback
            try {
                const fallbackResponse = await axios.post(`${backendUrl}/api/user/credits`, 
                    { clerkId: user.id },
                    {
                        headers: {
                            token: token
                        }
                    }
                );
                
                if (fallbackResponse.data.success) {
                    setCredits(fallbackResponse.data.credits);
                }
            } catch (fallbackError) {
                console.error('Fallback credit fetch failed:', fallbackError);
            }
        }
    };

    // Remove background from image
    const removeBackground = async (imageFile) => {
        try {
            if (!isSignedIn) {
                setError('Please sign in to use this feature');
                return false;
            }

            setIsProcessing(true);
            setError(null);
            
            const token = await getToken();
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await axios.post(
                `${backendUrl}/api/bg-removal/remove-background`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (response.data.success) {
                setOriginalImage(response.data.data.originalImage);
                setProcessedImage(response.data.data.resultImage);
                setCredits(response.data.data.remainingCredits);
                return true;
            } else {
                setError(response.data.message);
                return false;
            }
        } catch (error) {
            console.error('Error removing background:', error);
            setError(
                error.response?.data?.message || 
                'An error occurred while processing your image. Please try again.'
            );
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    // Reset images
    const resetImages = () => {
        setOriginalImage(null);
        setProcessedImage(null);
        setError(null);
    };

    const value = {
        originalImage,
        processedImage,
        isProcessing,
        credits,
        error,
        removeBackground,
        fetchCredits,
        resetImages,
        setError
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
