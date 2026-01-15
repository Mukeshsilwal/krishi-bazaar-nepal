import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMyListings } from '../hooks/useMyListings';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowLeft, Upload } from 'lucide-react';
import { useMasterData } from '../../../hooks/useMasterData';

export default function CreateListingPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const { createListing, updateListing, getListingById, uploadImage } = useMyListings();
    const { t, language } = useLanguage();

    // Fetch Master Data
    const { data: crops, loading: loadingCrops } = useMasterData('CROP_TYPE');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        cropName: '',
        category: '',
        variety: '',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        location: '',
        description: '',
        harvestDate: '',
        harvestWindow: '',
        dailyQuantityLimit: '',
        orderCutoffTime: '',
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchListing = async () => {
                try {
                    setLoading(true);
                    const data = await getListingById(id);
                    setFormData({
                        cropName: data.cropName || '',
                        category: data.category || '',
                        variety: data.variety || '',
                        quantity: data.quantity || '',
                        unit: data.unit || 'kg',
                        pricePerUnit: data.pricePerUnit || '',
                        location: data.location || '',
                        description: data.description || '',
                        harvestDate: data.harvestDate ? new Date(data.harvestDate).toISOString().split('T')[0] : '',
                        harvestWindow: data.harvestWindow || '',
                        dailyQuantityLimit: data.dailyQuantityLimit || '',
                        orderCutoffTime: data.orderCutoffTime || '',
                    });
                } catch (err) {
                    console.error(err);
                    setError('Failed to load listing details');
                } finally {
                    setLoading(false);
                }
            };
            fetchListing();
        }
    }, [id]);
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
            // Create or Update listing
            let listingId = id;

            if (isEditMode) {
                await updateListing(id, formData);
            } else {
                const response = await createListing(formData);
                listingId = response.data?.id || response.id;
            }

            // Upload image if provided
            if (imageFile && listingId) {
                await uploadImage(listingId, imageFile, true);
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
        <div className="bg-gray-50 min-h-full">
            <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/my-listings')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        {t('listings.back')}
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditMode ? 'Edit Listing' : t('listings.create')}
                    </h1>
                    <p className="text-gray-600">{t('listings.subtitle')}</p>
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
                            {t('listings.form.cropName')} *
                        </label>
                        {loadingCrops ? (
                            <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
                        ) : (
                            <select
                                name="cropName"
                                value={formData.cropName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">{t('listings.form.selectCrop')}</option>
                                {crops.map((crop) => (
                                    <option key={crop.code} value={crop.labelEn}>
                                        {language === 'ne' ? crop.labelNe : crop.labelEn}
                                    </option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{t('listings.form.selectCrop')}</p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="VEGETABLES">Vegetables</option>
                            <option value="FRUITS">Fruits</option>
                            <option value="GRAINS">Grains</option>
                            <option value="LIVESTOCK">Livestock</option>
                            <option value="DAIRY">Dairy</option>
                            <option value="OTHERS">Others</option>
                        </select>
                    </div>

                    {/* Variety */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.variety')}
                        </label>
                        <input
                            type="text"
                            name="variety"
                            value={formData.variety}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder={t('listings.form.placeholder.variety')}
                        />
                    </div>

                    {/* Quantity and Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('listings.form.quantity')} *
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder={t('listings.form.placeholder.quantity')}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('listings.form.unit')} *
                            </label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="kg">{t('listings.form.unit.kg')}</option>
                                <option value="quintal">{t('listings.form.unit.quintal')}</option>
                                <option value="ton">{t('listings.form.unit.ton')}</option>
                                <option value="piece">{t('listings.form.unit.piece')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Price Per Unit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.price')} *
                        </label>
                        <input
                            type="number"
                            name="pricePerUnit"
                            value={formData.pricePerUnit}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder={t('listings.form.placeholder.price')}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.location')} *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder={t('listings.form.placeholder.location')}
                            required
                        />
                    </div>

                    {/* Harvest Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.harvestDate')}
                        </label>
                        <input
                            type="date"
                            name="harvestDate"
                            value={formData.harvestDate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Harvest Window */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.harvestWindow')} ({t('common.days')})
                        </label>
                        <input
                            type="number"
                            name="harvestWindow"
                            value={formData.harvestWindow}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., 3"
                            min="1"
                        />
                    </div>

                    {/* Daily Quantity Limit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.dailyQuantityLimit')}
                        </label>
                        <input
                            type="number"
                            name="dailyQuantityLimit"
                            value={formData.dailyQuantityLimit}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., 50"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    {/* Order Cutoff Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.orderCutoffTime')}
                        </label>
                        <input
                            type="time"
                            name="orderCutoffTime"
                            value={formData.orderCutoffTime}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.description')}
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder={t('listings.form.placeholder.description')}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('listings.form.image')}
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition">
                                <Upload size={20} />
                                {t('listings.form.chooseImage')}
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
                            {t('listings.form.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                        >
                            {loading ? t('listings.form.submitting') : (isEditMode ? 'Update Listing' : t('listings.form.submit'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
