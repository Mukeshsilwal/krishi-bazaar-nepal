import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useMyListings } from '../hooks/useMyListings';
import { useLanguage } from '../../../context/LanguageContext';
import { Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function MyListingsPage() {
    const { listings, loading, error, deleteListing, refetch } = useMyListings();
    const { t } = useLanguage();
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    const handleDelete = (id: string) => {
        setDeleteDialog({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        try {
            await deleteListing(deleteDialog.id);
        } catch (err) {
            toast.error('Failed to delete listing');
        } finally {
            setDeleteDialog({ open: false, id: null });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'SOLD':
                return 'bg-gray-100 text-gray-800';
            case 'EXPIRED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    // Safely calculate stats
    const listingsArray = Array.isArray(listings) ? listings : [];
    const stats = {
        total: listingsArray.length,
        active: listingsArray.filter((l) => l.status === 'ACTIVE').length,
        sold: listingsArray.filter((l) => l.status === 'SOLD').length,
    };

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('dashboard.myListings')}
                    </h1>
                    <p className="text-gray-600">
                        {t('listings.manage')}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600 mb-1">{t('listings.stats.total')}</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600 mb-1">{t('listings.stats.active')}</div>
                        <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600 mb-1">{t('listings.stats.sold')}</div>
                        <div className="text-3xl font-bold text-gray-600">{stats.sold}</div>
                    </div>
                </div>

                {/* Create Button */}
                <div className="mb-6 flex gap-3">
                    <Link
                        to="/marketplace/create"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                    >
                        <Plus size={20} />
                        {t('listings.create')}
                    </Link>
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        title={t('listings.refresh')}
                    >
                        <RefreshCw size={20} />
                        {t('listings.refresh')}
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Listings Grid */}
                {!loading && !error && (
                    <>
                        {listingsArray.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <div className="text-6xl mb-4">🌾</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {t('listings.empty.title')}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {t('listings.empty.desc')}
                                </p>
                                <Link
                                    to="/marketplace/create"
                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                                >
                                    <Plus size={20} />
                                    {t('listings.create')}
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listingsArray.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                                    >
                                        {/* Image */}
                                        <div className="h-48 bg-gray-200 relative">
                                            {listing.images && listing.images.length > 0 ? (
                                                <img
                                                    src={listing.images[0].imageUrl}
                                                    alt={listing.cropName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                                    🌾
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                        listing.status
                                                    )}`}
                                                >
                                                    {listing.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {listing.cropName}
                                            </h3>
                                            <div className="space-y-1 text-sm text-gray-600 mb-4">
                                                <p>
                                                    {t('listings.form.quantity')}: {listing.quantity} {listing.unit}
                                                </p>
                                                <p className="text-lg font-bold text-green-600">
                                                    Rs. {listing.pricePerUnit}/{listing.unit}
                                                </p>
                                                <p>{t('listings.form.location')}: {listing.location}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/listing/${listing.id}`}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition text-sm"
                                                >
                                                    <Eye size={16} />
                                                    {t('listings.actions.view')}
                                                </Link>
                                                <Link
                                                    to={`/edit-listing/${listing.id}`}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 transition text-sm"
                                                >
                                                    <Edit size={16} />
                                                    {t('listings.actions.edit')}
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(listing.id)}
                                                    className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition text-sm"
                                                >
                                                    <Trash2 size={16} />
                                                    {t('listings.actions.delete')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                onConfirm={confirmDelete}
                title={t('listings.actions.delete') || "Delete Listing"}
                description={t('listings.confirmDelete') || "Are you sure you want to delete this listing? This action cannot be undone."}
                confirmText={t('listings.actions.delete') || "Delete"}
                cancelText={t('common.cancel') || "Cancel"}
                variant="destructive"
                icon={<Trash2 className="h-6 w-6 text-red-600" />}
            />
        </div>
    );
}
