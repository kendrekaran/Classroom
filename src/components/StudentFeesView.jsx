import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, AlertCircle, DollarSign, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDarkMode } from '../utils/DarkModeContext';

function StudentFeesView({ batchId }) {
    const [loading, setLoading] = useState(true);
    const [feesPayment, setFeesPayment] = useState(null);
    const [error, setError] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const { darkMode } = useDarkMode();

    useEffect(() => {
        fetchFeesData();
    }, [batchId]);

    const fetchFeesData = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('user'));

            if (!userData) {
                console.error('No user data found in localStorage');
                setError('Authentication required');
                setLoading(false);
                return;
            }

            console.log('Fetching fees data with:', {
                batchId,
                userId: userData.id,
                hasToken: !!userData.token
            });

            const response = await axios.get(
                `http://localhost:3000/user/student/batches/${batchId}/fees`,
                {
                    params: { userId: userData.id },
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Fees data response:', response.data);

            if (response.data.success) {
                setFeesPayment(response.data.feesPayment);
            } else {
                throw new Error(response.data.message || 'Failed to fetch fees data');
            }
        } catch (error) {
            console.error('Error fetching fees data:', error);
            setError(error.response?.data?.message || 'Failed to load fees data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        if (!status) return null;
        
        switch (status) {
            case 'paid':
                return <Check className="h-5 w-5 text-green-500" />;
            case 'pending':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'overdue':
                return <X className="h-5 w-5 text-red-500" />;
            default:
                return null;
        }
    };

    // Razorpay payment handling
    const initiatePayment = async () => {
        try {
            setIsProcessingPayment(true);
            const userData = JSON.parse(localStorage.getItem('user'));
            
            if (!userData || !userData.id || !userData.token) {
                toast.error('Authentication required');
                setIsProcessingPayment(false);
                return;
            }

            // Request a new order from the backend
            const response = await axios.post(
                `http://localhost:3000/user/student/batches/${batchId}/fees/initiate-payment`,
                { userId: userData.id },
                {
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to initiate payment');
            }

            const { order, key_id, amount, student } = response.data;

            // Load Razorpay script dynamically
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: key_id,
                    amount: order.amount, // Amount in paise
                    currency: order.currency,
                    name: 'Classroom App',
                    description: `Fees Payment for ${order.notes.batchName}`,
                    order_id: order.id,
                    prefill: {
                        name: student.name,
                        email: student.email,
                        contact: student.contact
                    },
                    theme: {
                        color: '#4f46e5' // Indigo color
                    },
                    handler: function(response) {
                        handlePaymentSuccess(response);
                    },
                    modal: {
                        ondismiss: function() {
                            setIsProcessingPayment(false);
                            toast.info('Payment cancelled');
                        }
                    }
                };

                const razorpayWindow = new window.Razorpay(options);
                razorpayWindow.open();
            };

            script.onerror = () => {
                setIsProcessingPayment(false);
                toast.error('Failed to load payment gateway');
                document.body.removeChild(script);
            };
        } catch (error) {
            console.error('Error initiating payment:', error);
            
            // Get a more user-friendly error message
            let errorMessage = 'Failed to initiate payment';
            
            if (error.response) {
                // Server returned an error response
                if (error.response.data && error.response.data.error) {
                    // Handle structured error from Razorpay
                    if (error.response.data.error.description) {
                        errorMessage = `Payment gateway error: ${error.response.data.error.description}`;
                    } else {
                        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
                    }
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
            setIsProcessingPayment(false);
        }
    };

    const handlePaymentSuccess = async (response) => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            
            // Verify payment with backend
            const verifyResponse = await axios.post(
                `http://localhost:3000/user/student/batches/${batchId}/fees/verify-payment`,
                {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    userId: userData.id
                },
                {
                    headers: {
                        'Authorization': `Bearer ${userData.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (verifyResponse.data.success) {
                toast.success('Payment successful!');
                // Refresh fees data to show updated status
                fetchFeesData();
            } else {
                throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.response?.data?.message || error.message || 'Payment verification failed');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <div className="text-center text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
            <div className={`${darkMode ? 'bg-indigo-900' : 'bg-indigo-50'} p-6`}>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center`}>
                    <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
                    Fees Information
                </h2>
            </div>

            <div className="p-6">
                {feesPayment ? (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Payment Status</h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Last updated: {new Date(feesPayment.paymentDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-full ${getStatusColor(feesPayment.status)} flex items-center`}>
                                {getStatusIcon(feesPayment.status)}
                                <span className="ml-2 text-sm font-medium">
                                    {feesPayment.status.charAt(0).toUpperCase() + feesPayment.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Amount</h4>
                                <p className={`text-2xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>₹{feesPayment.amount}</p>
                            </div>
                            <div>
                                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Payment Method</h4>
                                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                    {feesPayment.paymentMethod.charAt(0).toUpperCase() + feesPayment.paymentMethod.slice(1)}
                                </p>
                            </div>
                        </div>

                        {feesPayment.remarks && (
                            <div>
                                <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Remarks</h4>
                                <p className={`${darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'} p-3 rounded-md`}>
                                    {feesPayment.remarks}
                                </p>
                            </div>
                        )}

                        {/* Show pay online button for pending/overdue payments */}
                        {(feesPayment.status === 'pending' || feesPayment.status === 'overdue') && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={initiatePayment}
                                    disabled={isProcessingPayment}
                                    className={`inline-flex items-center px-4 py-2 rounded-md text-white font-medium ${
                                        isProcessingPayment 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                    } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                >
                                    {isProcessingPayment ? (
                                        <>
                                            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Pay Online Now
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <DollarSign className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                        <h3 className={`mt-2 text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>No Payment Information</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            Your fees payment information has not been recorded yet.
                            <br />Please contact your teacher or administrator.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentFeesView; 