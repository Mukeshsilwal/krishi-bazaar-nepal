import { useState, useEffect } from 'react';
import { useListings } from '../hooks/useListings';
import { useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';
import SearchBar from '../components/SearchBar';
import VisualFilter from '../components/VisualFilter';
import { useLanguage } from '../../../context/LanguageContext';

export default function MarketplacePage() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        cropName: '',
        category: '',
        district: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'created',
    });
    const [availableCrops, setAvailableCrops] = useState<string[]>([]);

    const { listings, loading, error, pagination, nextPage, prevPage } = useListings(filters);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await listingService.getAvailableCrops();
                if (response.code === 0) {
                    setAvailableCrops(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch available crops", err);
            }
        };
        fetchCrops();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Filters are already applied via useListings hook
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Search Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {t('marketplace.hero.title')}
                    </h1>
                    <p className="text-green-100 text-lg mb-8">
                        {t('marketplace.hero.subtitle')}
                    </p>

                    <div className="max-w-2xl mx-auto">
                        <SearchBar
                            value={filters.cropName}
                            onChange={(val) => setFilters({ ...filters, cropName: val, category: '' })}
                            onSearch={handleSearch}
                            suggestions={availableCrops}
                            placeholder={t('marketplace.search.placeholder')}
                            className="w-full text-lg shadow-lg mb-8"
                        />

                        <div className="mt-8">
                            <p className="text-green-100 text-sm mb-4 font-medium uppercase tracking-wider opacity-90">Browse by Category</p>
                            <VisualFilter
                                onSelect={(cat) => {
                                    setFilters({ ...filters, category: cat, cropName: '' });
                                }}
                                selectedCategory={filters.category}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Filters Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 flex-1">
                            <input
                                type="text"
                                placeholder="District"
                                value={filters.district}
                                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min Price"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-32"
                                />
                                <input
                                    type="number"
                                    placeholder="Max Price"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-32"
                                />
                            </div>
                        </div>

                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white min-w-[200px]"
                        >
                            <option value="created">Latest Listings</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </form>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        Error: {error}
                    </div>
                )}

                {/* Listings Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map((listing: any) => (
                                <div
                                    key={listing.id}
                                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                                    onClick={() => navigate(`/listing/${listing.id}`)}
                                >
                                    {/* Image */}
                                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                                        {listing.images && listing.images.length > 0 ? (
                                            <img
                                                src={listing.images.find((img: any) => img.isPrimary)?.imageUrl || listing.images[0]?.imageUrl}
                                                alt={listing.cropName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.cropName}</h3>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-2xl font-bold text-green-600">
                                                NPR {listing.pricePerUnit}
                                            </span>
                                            <span className="text-gray-600">per {listing.unit}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>📦 Available: {listing.quantity} {listing.unit}</p>
                                            {listing.harvestDate && (
                                                <p>🌾 Harvest: {new Date(listing.harvestDate).toLocaleDateString()}</p>
                                            )}
                                            <p>📍 {listing.location}</p>
                                            <p>👨‍🌾 {listing.farmer.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={prevPage}
                                    disabled={pagination.page === 0}
                                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-6 py-2 bg-white border border-gray-300 rounded-lg">
                                    Page {pagination.page + 1} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={nextPage}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
