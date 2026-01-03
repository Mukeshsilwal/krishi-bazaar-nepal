import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import paymentService from '../../../services/paymentService';

export default function PaymentRedirectPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'FAILED'>('VERIFYING');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const verify = async () => {
            try {
                // Determine params based on eSewa V2 response
                // eSewa V2 often sends 'data' param which is base64 encoded, 
                // but the payment service `verifyPayment` takes transactionId and gatewayTransactionId.
                // Assuming the backend handles the decoding or the redirect URL params map to these.

                // Common keys: 
                // oid / transaction_uuid -> transactionId
                // refId / transaction_code -> gatewayTransactionId

                // Let's try to extract common params
                const transactionId = searchParams.get('oid') || searchParams.get('transaction_uuid') || searchParams.get('transactionId');
                const gatewayTransactionId = searchParams.get('refId') || searchParams.get('transaction_code') || searchParams.get('gatewayTransactionId');
                const data = searchParams.get('data');

                let rawData = data;

                // Manual extraction for malformed URLs (e.g. double '?' from gateway)
                // URL: ...?txnId=UUID?data=BLOB
                if (!rawData) {
                    const href = window.location.href;
                    if (href.includes('?data=')) {
                        const parts = href.split('?data=');
                        if (parts.length > 1) {
                            rawData = parts.pop()?.split('&')[0];
                        }
                    } else if (href.includes('&data=')) {
                        const parts = href.split('&data=');
                        if (parts.length > 1) {
                            rawData = parts.pop()?.split('&')[0];
                        }
                    }
                }

                if (rawData) {
                    try {
                        const decodedData = JSON.parse(atob(rawData));
                        console.log('Decoded eSewa data:', decodedData);

                        if (decodedData.transaction_uuid && (decodedData.transaction_code || decodedData.refId)) {
                            const txnUuid = decodedData.transaction_uuid;
                            const gatewayRefId = decodedData.transaction_code || decodedData.refId;

                            await paymentService.verifyPayment(txnUuid, gatewayRefId);
                            setStatus('SUCCESS');
                            setTimeout(() => {
                                navigate(`/orders/${txnUuid}`);
                            }, 2000);
                            return;
                        }
                    } catch (e) {
                        console.error('Failed to decode payment data', e);
                    }
                }

                if (transactionId && gatewayTransactionId) {
                    await paymentService.verifyPayment(transactionId, gatewayTransactionId);
                    setStatus('SUCCESS');
                    setTimeout(() => {
                        navigate('/orders');
                    }, 2000);
                } else if (data) {
                    console.error('Invalid or missing transaction parameters in data');
                    setError('Invalid payment response parameters');
                    setStatus('FAILED');
                } else {
                    setError('No payment parameters found');
                    setStatus('FAILED');
                }

            } catch (err: any) {
                console.error('Payment verification failed:', err);
                setError(err.response?.data?.message || 'Payment verification failed');
                setStatus('FAILED');
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {status === 'VERIFYING' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-900">Verifying Payment...</h2>
                        <p className="text-gray-600 mt-2">Please do not close this window.</p>
                    </>
                )}

                {status === 'SUCCESS' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✅</span>
                        </div>
                        <h2 className="text-xl font-semibold text-green-600">Payment Successful!</h2>
                        <p className="text-gray-600 mt-2">Redirecting to orders...</p>
                    </>
                )}

                {status === 'FAILED' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">❌</span>
                        </div>
                        <h2 className="text-xl font-semibold text-red-600">Payment Failed</h2>
                        <p className="text-gray-600 mt-2">{error}</p>
                        <button
                            onClick={() => navigate('/orders')}
                            className="mt-6 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                        >
                            Return to Orders
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
