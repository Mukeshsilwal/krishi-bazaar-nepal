import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useSettings } from '@/hooks/useSettings';

export default function LoginPage() {
    const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { settings } = useSettings();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.login(identifier);
            if (result.success) {
                setStep('otp');
            } else {
                setError(result.message || 'Failed to send OTP');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(identifier, otp);
            if (result.success) {
                window.location.href = '/';
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
                        <h1 className="text-3xl font-bold text-green-600 mb-2">{settings.COMPANY_NAME || 'Kisan Sarathi'}</h1>
                        <p className="text-gray-600">
                            {step === 'mobile' ? 'Enter your login details' : 'Enter OTP'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {step === 'mobile' ? (
                        <form onSubmit={handleRequestOtp}>
                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Mobile Number or Email
                                </label>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Enter mobile number or email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    OTP sent to {identifier}. Check your email/SMS.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 mb-3"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('mobile');
                                    setOtp('');
                                    setError('');
                                }}
                                className="w-full text-green-600 py-2 font-medium hover:underline"
                            >
                                Change Identifier
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <a href="/register" className="text-green-600 font-semibold hover:underline">
                                Register
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
