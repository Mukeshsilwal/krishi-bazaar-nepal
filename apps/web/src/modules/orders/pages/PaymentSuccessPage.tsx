import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import paymentService from '../../../services/paymentService'; // Adjust path if needed

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [receipt, setReceipt] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const params = useParams(); // params.txnId
    // Extract params
    // Priority: Path Variable -> Query Param 'txnId' -> Query Param 'oid' (eSewa fallback)
    const txnId = params.txnId || searchParams.get('txnId') || searchParams.get('oid');
    const data = searchParams.get('data');

    useEffect(() => {
        if (!txnId && !data) {
            setError('Invalid transaction details');
            setLoading(false);
            return;
        }

        verifyPayment();
    }, [txnId, data]);

    const verifyPayment = async () => {
        try {
            let transactionId = txnId;
            let gatewayTransactionId = '';

            if (data) {
                try {
                    // eSewa data is base64 encoded JSON
                    const decodedData = atob(data);
                    const jsonData = JSON.parse(decodedData);

                    // The 'transaction_uuid' from eSewa IS our order's transaction ID we sent them
                    if (jsonData.transaction_uuid) {
                        transactionId = jsonData.transaction_uuid;
                    }

                    // The 'transaction_code' is eSewa's reference ID
                    gatewayTransactionId = jsonData.transaction_code || '';
                } catch (e) {
                    console.error('Failed to decode eSewa data:', e);
                }
            }

            // Clean up transactionId if it comes from URL and has '?' appended
            if (transactionId && transactionId.includes('?')) {
                transactionId = transactionId.split('?')[0];
            }

            if (!transactionId) {
                throw new Error("Transaction ID missing");
            }

            const response = await paymentService.verifyPayment(transactionId, gatewayTransactionId);

            if (response.code === 0) {
                setReceipt(response.data);
            }
        } catch (err: any) {
            const { resolveUserMessage } = await import('@/utils/errorUtils');
            setError(resolveUserMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                    <div className="text-red-600 text-5xl mb-4">✗</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 w-full"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full relative overflow-hidden">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>

                <div className="text-center mb-6">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                    <p className="text-gray-500">Your order has been completed.</p>
                </div>

                <div className="border-t border-b border-gray-100 py-4 my-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono text-gray-900 select-all">
                            {(receipt?.transactionId || receipt?.id || txnId || '').split('?')[0]}
                        </span>
                    </div>
                    {receipt?.amount && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount Paid</span>
                            <span className="font-bold text-gray-900">NPR {receipt.amount}</span>
                        </div>
                    )}
                    {receipt?.paymentMethod && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Payment Method</span>
                            <span className="font-medium text-gray-900">{receipt.paymentMethod}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/orders')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full font-medium"
                >
                    Back to My Orders
                </button>
            </div>
        </div>
    );
}
