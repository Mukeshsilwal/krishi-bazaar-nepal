import { useState } from 'react';
import { useListings } from '../hooks/useListings';
import { useNavigate } from 'react-router-dom';
import { useMasterData } from '../../../hooks/useMasterData';
import { useLanguage } from '../../../context/LanguageContext';

interface MarketplaceSectionProps {
    id?: string;
}

export default function MarketplaceSection({ id }: MarketplaceSectionProps) {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const { data: crops, loading: loadingCrops } = useMasterData('CROP_TYPE');
    const [filters, setFilters] = useState({
        cropName: '',
        district: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'created',
    });

    const { listings, loading, pagination, nextPage, prevPage } = useListings(filters);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Filters are already applied via useListings hook
    };

    return (
        <section id={id} className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="mb-4 inline-block rounded-full bg-green-100 px-5 py-2 text-base font-semibold text-green-600">
                        बजार / Marketplace
                    </span>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
                        ताजा <span className="text-green-600">तरकारी तथा फलफूल</span>
                    </h2>
                    <p className="text-lg text-gray-600">
                        Buy directly from farmers
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-6xl mx-auto">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative">
                            {loadingCrops ? (
                                <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
                            ) : (
                                <select
                                    value={filters.cropName}
                                    onChange={(e) => setFilters({ ...filters, cropName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none bg-white"
                                >
                                    <option value="">All Crops</option>
                                    {crops.map((crop) => (
                                        <option key={crop.code} value={language === 'ne' ? crop.labelNe : crop.labelEn}>
                                            {language === 'ne' ? crop.labelNe : crop.labelEn}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="District"
                            value={filters.district}
                            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
                        >
                            <option value="created">Latest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </form>
                </div>

                {/* Listings Grid */}
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {listings.map((listing: any) => (
                                    <div
                                        key={listing.id}
                                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 cursor-pointer overflow-hidden group"
                                        onClick={() => navigate(`/listing/${listing.id}`)}
                                    >
                                        {/* Image */}
                                        <div className="h-48 bg-gray-200 overflow-hidden relative">
                                            {listing.images && listing.images.length > 0 ? (
                                                <img
                                                    src={listing.images.find((img: any) => img.isPrimary)?.imageUrl || listing.images[0]?.imageUrl}
                                                    alt={listing.cropName}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition">{listing.cropName}</h3>
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        NPR {listing.pricePerUnit}
                                                    </p>
                                                    <p className="text-sm text-gray-500">per {listing.unit}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-700">📦 {listing.quantity} {listing.unit}</p>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                                <p className="flex items-center text-sm text-gray-600">
                                                    <span className="mr-2">📍</span> {listing.location}
                                                </p>
                                                <p className="flex items-center text-sm text-gray-600">
                                                    <span className="mr-2">👨‍🌾</span> {listing.farmer.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-12 flex justify-center gap-4">
                                    <button
                                        onClick={prevPage}
                                        disabled={pagination.page === 0}
                                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700">
                                        Page {pagination.page + 1} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={nextPage}
                                        disabled={pagination.page >= pagination.totalPages - 1}
                                        className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
