import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useMyListings } from '../hooks/useMyListings';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowLeft, Upload } from 'lucide-react';

export default function CreateListingPage() {
    const navigate = useNavigate();
    const { createListing, uploadImage } = useMyListings();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        cropName: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        location: '',
        description: '',
        harvestDate: '',
    });
    const [imageFile, setImageFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create the listing
            const newListing = await createListing(formData);

            // Upload image if provided
            if (imageFile && newListing.id) {
                await uploadImage(newListing.id, imageFile, true);
            }


            // Navigate back to my listings with a reload to ensure fresh data
            window.location.href = '/my-listings';
        } catch (err) {
            setError(err.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/my-listings')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to My Listings
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('listings.create') || 'Create New Listing'}
                    </h1>
                    <p className="text-gray-600">Fill in the details to list your crop for sale</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Crop Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Crop Name *
                        </label>
                        <input
                            type="text"
                            name="cropName"
                            value={formData.cropName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., Rice, Wheat, Tomato"
                            required
                        />
                    </div>

                    {/* Variety */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Variety
                        </label>
                        <input
                            type="text"
                            name="variety"
                            value={formData.variety}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., Basmati, Hybrid"
                        />
                    </div>

                    {/* Quantity and Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="100"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unit *
                            </label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="kg">KG</option>
                                <option value="quintal">Quintal</option>
                                <option value="ton">Ton</option>
                                <option value="piece">Piece</option>
                            </select>
                        </div>
                    </div>

                    {/* Price Per Unit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price Per Unit (Rs.) *
                        </label>
                        <input
                            type="number"
                            name="pricePerUnit"
                            value={formData.pricePerUnit}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="50"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., Kathmandu, Ward 5"
                            required
                        />
                    </div>

                    {/* Harvest Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Harvest Date
                        </label>
                        <input
                            type="date"
                            name="harvestDate"
                            value={formData.harvestDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Describe your crop, quality, organic certification, etc."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Crop Image
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition">
                                <Upload size={20} />
                                Choose Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {imageFile && (
                                <span className="text-sm text-gray-600">{imageFile.name}</span>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/my-listings')}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Listing'}
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
}
