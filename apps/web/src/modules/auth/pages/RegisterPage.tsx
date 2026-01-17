import { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useSettings } from '@/hooks/useSettings';
import api from '@/services/api';
import { AUTH_ENDPOINTS } from '@/config/endpoints';

export default function RegisterPage() {
    const [step, setStep] = useState<'form' | 'otp' | 'pending'>('form');
    const [formData, setFormData] = useState({
        mobileNumber: '',
        email: '',
        name: '',
        role: 'BUYER',
        district: '',
        ward: '',
        landSize: '',
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const { settings } = useSettings();

    // Fetch available roles on component mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get(AUTH_ENDPOINTS.ROLES);
                if (response.data.code === 0) {
                    setAvailableRoles(response.data.data);
                }
            } catch (error) {
                // Fallback to default roles if API fails
                setAvailableRoles(['FARMER', 'BUYER', 'VENDOR', 'EXPERT']);
            }
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.register(formData);

            if (result.code === 0) {
                setStep('otp');
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.verifyOtp(formData.mobileNumber, otp);

            if (result.code === 0) {
                // Check if user is VENDOR or EXPERT (needs approval)
                const userRole = formData.role;
                if (userRole === 'VENDOR' || userRole === 'EXPERT') {
                    // Show approval pending message
                    setStep('pending');
                } else {
                    // FARMER and BUYER can login immediately
                    window.location.href = '/';
                }
            } else {
                setError(result.message || 'Invalid OTP');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-green-600 mb-2">Join {settings.COMPANY_NAME || 'Kisan Sarathi'}</h1>
                        <p className="text-gray-600">
                            {step === 'form' ? 'Create your account' : 'Verify your mobile number'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {step === 'form' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Mobile Number *</label>
                                <input
                                    type="tel"
                                    value={formData.mobileNumber}
                                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                    placeholder="98XXXXXXXX"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                    minLength={10}
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit mobile number"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Your full name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">I am a *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    {availableRoles.length === 0 ? (
                                        <option value="">Loading roles...</option>
                                    ) : (
                                        availableRoles.map((role) => (
                                            <option key={role} value={role}>
                                                {role.charAt(0) + role.slice(1).toLowerCase()}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">District *</label>
                                <input
                                    type="text"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    placeholder="e.g., Kathmandu"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Ward</label>
                                <input
                                    type="text"
                                    value={formData.ward}
                                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                    placeholder="Ward number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {formData.role === 'FARMER' && (
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Land Size (in Ropani)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.landSize}
                                        onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                                        placeholder="e.g., 2.5"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    ) : step === 'otp' ? (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                                    required
                                />
                                <p className="text-sm text-gray-700 mt-2 font-medium">
                                    Please check your email for the OTP
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </button>
                        </form>
                    ) : (
                        // Pending Approval Screen for VENDOR/EXPERT
                        <div className="text-center py-8">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">Registration Successful!</h2>
                                <p className="text-lg text-gray-600 mb-4">
                                    Your account has been created as a <span className="font-semibold text-green-600">{formData.role}</span>
                                </p>
                            </div>

                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                                <h3 className="font-semibold text-yellow-800 mb-2">⏳ Approval Pending</h3>
                                <p className="text-yellow-700 text-sm leading-relaxed">
                                    Your account is currently pending approval from our admin team.
                                    You will receive a notification once your account has been verified and approved.
                                    This usually takes 24-48 hours.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    <strong>What happens next?</strong>
                                </p>
                                <ul className="text-sm text-gray-600 text-left space-y-2">
                                    <li className="flex items-start">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span>Admin will review your registration</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span>You'll receive an email notification upon approval</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-green-600 mr-2">✓</span>
                                        <span>Once approved, you can login and access all features</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => window.location.href = '/login'}
                                className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                Go to Login Page
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <a href="/login" className="text-green-600 font-semibold hover:underline">
                                Login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
