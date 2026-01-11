import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../modules/auth/context/AuthContext';
import { User, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';
import imageUploadService from '../services/imageUploadService';

export default function ProfilePage() {
    const { t } = useLanguage();
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        district: user?.district || '',
        ward: user?.ward || '',
        landSize: user?.landSize || '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser(formData);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            district: user?.district || '',
            ward: user?.ward || '',
            landSize: user?.landSize || '',
        });
        setIsEditing(false);
    };

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('dashboard.profile') || 'My Profile'}
                    </h1>
                    <p className="text-gray-600">
                        {t('profile.manage') || 'Manage your account information'}
                    </p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-green-600 relative overflow-hidden group">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || '?'
                                )}

                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer" onClick={() => document.getElementById('profile-upload')?.click()}>
                                        <Edit2 className="text-white w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="profile-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        try {
                                            // Assume import imageUploadService from '@/services/imageUploadService'
                                            const url = await imageUploadService.uploadImage(e.target.files[0], 'PROFILE');
                                            setFormData(prev => ({ ...prev, profileImage: url }));
                                            // Also update user context if needed or wait for save
                                        } catch (err) {
                                            console.error(err);
                                            alert('Failed to upload image');
                                        }
                                    }
                                }}
                            />
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
                                <p className="text-green-100">{user?.role || 'BUYER'}</p>
                                <p className="text-sm text-green-100 mt-1">
                                    <Phone size={14} className="inline mr-1" />
                                    {user?.mobileNumber}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Personal Information
                            </h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                                >
                                    <Edit2 size={18} />
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User size={16} className="inline mr-2" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail size={16} className="inline mr-2" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Mobile (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone size={16} className="inline mr-2" />
                                        Mobile Number
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.mobileNumber || ''}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Mobile number cannot be changed
                                    </p>
                                </div>

                                {/* District */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin size={16} className="inline mr-2" />
                                        District
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Ward */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ward Number
                                    </label>
                                    <input
                                        type="text"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Land Size (Farmers only) */}
                                {user?.role === 'FARMER' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Land Size (in Ropani)
                                        </label>
                                        <input
                                            type="number"
                                            name="landSize"
                                            value={formData.landSize}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="mt-8 flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} />
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Account Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600 mb-1">{t('profile.accountType') || 'Account Type'}</div>
                        <div className="text-2xl font-bold text-gray-900">{user?.role}</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600 mb-1">{t('profile.memberSince') || 'Member Since'}</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : 'N/A'}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-sm text-gray-600 mb-1">{t('profile.verificationStatus') || 'Verification Status'}</div>
                        <div className="text-2xl font-bold text-green-600">
                            {user?.verified ? (t('profile.verified') || 'Verified') : (t('profile.pending') || 'Pending')}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
