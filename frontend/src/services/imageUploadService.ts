import axios from 'axios';
import { API_URL } from '../config/app';

// Cloudinary configuration (Fallback values if env vars are missing/inconsistent, but backend provides signed params)
// The actual cloud name and upload options will come from the backend signature endpoint mostly.
// But validtion relies on checking the response.

export type UploadType = 'DIAGNOSIS' | 'CONTENT' | 'PROFILE' | 'OTHERS';

interface SignatureResponse {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

class ImageUploadService {
    /**
     * Upload an image toCloudinary using a signed request
     * @param file The file to upload
     * @param type The type of upload (determines folder)
     * @returns The secure URL of the uploaded image
     */
    async uploadImage(file: File, type: UploadType = 'OTHERS'): Promise<string> {

        try {
            // 1. Get signature from backend
            const signatureResponse = await this.getSignature(type);
            const { signature, timestamp, apiKey, cloudName, folder } = signatureResponse;

            // 2. Prepare FormData for Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp.toString());
            formData.append('signature', signature);
            formData.append('folder', folder);

            // 3. Upload to Cloudinary
            // Construct Cloudinary URL based on cloud name
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

            const response = await axios.post(cloudinaryUrl, formData, {
                onUploadProgress: (progressEvent) => {
                    // You could add a callback for progress here if needed
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));

                }
            });

            if (response.data && response.data.secure_url) {
                return response.data.secure_url;
            } else {
                throw new Error('Cloudinary response missing secure_url');
            }

        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    }

    private async getSignature(type: string): Promise<SignatureResponse> {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_URL}/uploads/cloudinary/signature`,
            null,
            {
                params: { uploadType: type },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    }
}

export const imageUploadService = new ImageUploadService();
export default imageUploadService;
