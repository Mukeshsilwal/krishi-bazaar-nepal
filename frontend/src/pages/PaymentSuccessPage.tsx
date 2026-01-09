import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import paymentService from '../services/paymentService'; // Adjust path if needed

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verify = async () => {
            // eSewa params: data (encoded)
            // Khalti params: pidx, transaction_id, amount, mobile, purchase_order_id, purchase_order_name

            // For eSewa V2, we might get a single 'data' param which is base64 encoded JSON
            const dataParam = searchParams.get('data');

            // For Khalti or legacy eSewa
            const transactionId = searchParams.get('transaction_id') || searchParams.get('idx') || searchParams.get('refId');

            // If eSewa V2 'data' is present, we might need to send it to backend to decode & verify.
            // Our backend PaymentService.verifyPayment(transactionId, gatewayTransactionId) expects IDs.
            // If it's eSewa, we might need a specific endpoint to handle the 'data' blob or decode it here.

            // BUT, our backend PaymentCallbackController.handleEsewaCallback takes 'data'.
            // However, that was a GET endpoint returning String.
            // Let's assume for now we reuse the verifyPayment or a new endpoint if needed.

            // If we have 'data', it's likely eSewa. Let's send it to a special verification endpoint or reuse.
            // Actually, for eSewa V2, the 'data' contains the status and transaction vars.
            // Let's try to verify using the existing verifyPayment if we can extract ID, 
            // OR simply call the PaymentCallbackController endpoint if we exposed it for frontend to call?
            // No, the CallbackController was server-to-server or redirect handling.

            // Simplified approach: Send whatever we have to backend.
            try {
                let response;
                if (dataParam) {
                    // eSewa V2
                    // We might need to decode it to get the PID (transaction ID) to call our verify API.
                    const decoded = JSON.parse(atob(dataParam));
                    // decoded = { total_amount, transaction_uuid, product_code, status, signature, signed_field_names }
                    // transaction_uuid is our system's transaction ID (or Order ID depending on what we sent).
                    if (decoded.status === 'COMPLETE') {
                        response = await paymentService.verifyPayment(decoded.transaction_uuid, decoded.transaction_code || dataParam);
                    } else {
                        throw new Error("Payment status not complete");
                    }
                } else {
                    // Khalti
                    const pidx = searchParams.get('pidx');
                    if (pidx) {
                        // Khalti verification usually needs pidx
                        response = await paymentService.verifyPayment(searchParams.get('purchase_order_id'), pidx);
                    } else {
                        // Fallback / Unknown
                        // Try generically
                        const txnId = searchParams.get('oid') || searchParams.get('q'); // eSewa legacy?
                        // ...
                        if (!txnId) throw new Error("Unknown payment parameters");
                    }
                }

                if (response && response.success) {
                    toast.success('भुक्तानी सफल भयो!'); // Payment successful
                    // Redirect to order details
                    const orderId = response.data.order ? response.data.order.id : response.data.orderId;
                    setTimeout(() => navigate(orderId ? `/orders/${orderId}` : '/orders'), 1500);
                } else {
                    toast.error('भुक्तानी प्रमाणिकरण असफल भयो।'); // Verification failed
                    navigate('/orders');
                }
            } catch (error) {
                console.error("Payment verification error", error);
                toast.error('भुक्तानी प्रक्रियामा समस्या आयो।');
                setVerifying(false);
            }
        };

        if (searchParams.toString()) {
            verify();
        } else {
            setVerifying(false); // No params
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                {verifying ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-800">भुक्तानी प्रमाणिकरण हुँदैछ...</h2>
                        <p className="text-gray-500 mt-2">कृपया एकैछिन पर्खनुहोस्</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold text-red-600">विवरण फेला परेन</h2>
                        <button onClick={() => navigate('/orders')} className="mt-4 text-blue-600 hover:underline">
                            फर्कनुहोस्
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
