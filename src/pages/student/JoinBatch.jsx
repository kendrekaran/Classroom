import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import axios from 'axios';
import StudentNavbar from '../../components/StudentNavbar';

function JoinBatch() {
    const [batchCode, setBatchCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in first');
                return;
            }

            const response = await axios.post(
                'http://localhost:3000/user/join-batch',
                { batch_code: batchCode },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Successfully joined the batch!');
                setTimeout(() => {
                    navigate('/student/batches');
                }, 2000);
            }
        } catch (error) {
            setError(
                error.response?.data?.message || 
                'Failed to join batch. Please check the batch code.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <StudentNavbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-md">
                                <UserPlus className="h-8 w-8 text-indigo-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white text-center">
                            Join a Batch
                        </h1>
                        <p className="mt-2 text-indigo-100 text-center">
                            Enter the batch code provided by your teacher
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 rounded-lg text-red-700">
                                <AlertCircle className="h-5 w-5" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-4 bg-green-50 rounded-lg text-green-700">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label 
                                    htmlFor="batchCode" 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Batch Code
                                </label>
                                <input
                                    id="batchCode"
                                    type="text"
                                    value={batchCode}
                                    onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
                                    placeholder="Enter batch code (e.g., BATCH001)"
                                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Joining...' : 'Join Batch'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-full py-3 px-4 border rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </form>

                        <div className="mt-6">
                            <p className="text-sm text-gray-500 text-center">
                                Don't have a batch code? Contact your teacher to get one.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JoinBatch;
