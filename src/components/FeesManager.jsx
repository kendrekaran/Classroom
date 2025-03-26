import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DollarSign, Check, X, AlertCircle, Edit, Search, TrendingUp, FileText, Calendar, UserCheck } from 'lucide-react';
import { useDarkMode } from '../utils/DarkModeContext';

function FeesManager({ batchId }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState([]);
    const [feesPayments, setFeesPayments] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [statsVisible, setStatsVisible] = useState(true);
    const [paymentForm, setPaymentForm] = useState({
        studentId: '',
        amount: '',
        paymentMethod: 'offline',
        status: 'paid',
        remarks: '',
        enableOnlinePayment: false
    });
    const { darkMode } = useDarkMode();

    // API base URL
    const API_BASE_URL = 'http://localhost:3000';

    // Fetch data when component mounts or batchId changes
    useEffect(() => {
        if (batchId) {
            fetchFeesData();
        }
    }, [batchId]);

    // Fetch students and fees payment data
    const fetchFeesData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch batch details to get students
            const batchResponse = await axios.get(`${API_BASE_URL}/admin/batches/${batchId}`);
            
            if (batchResponse.data?.success) {
                // Ensure students data is properly populated
                const studentsData = batchResponse.data.batch.students || [];
                setStudents(studentsData);
            } else {
                throw new Error(batchResponse.data?.message || 'Failed to fetch batch details');
            }

            // Fetch fees payments
            const feesResponse = await axios.get(`${API_BASE_URL}/admin/batches/${batchId}/fees`);

            if (feesResponse.data?.success) {
                setFeesPayments(feesResponse.data.feesPayments || []);
            } else {
                throw new Error(feesResponse.data?.message || 'Failed to fetch fees data');
            }
        } catch (error) {
            console.error('Error fetching fees data:', error);
            setError(error.response?.data?.message || error.message || 'Failed to load fees data');
            toast.error(error.response?.data?.message || error.message || 'Failed to load fees data');
        } finally {
            setLoading(false);
        }
    };

    // Open modal for adding/editing payment
    const handleOpenModal = (student) => {
        if (!student || !student._id) {
            toast.error('Invalid student data');
            return;
        }

        setSelectedStudent(student);
        
        // Find existing payment for this student
        const existingPayment = feesPayments.find(
            payment => payment.student && payment.student._id === student._id
        );
        
        if (existingPayment) {
            setPaymentForm({
                studentId: student._id,
                amount: existingPayment.amount || '',
                paymentMethod: existingPayment.paymentMethod || 'offline',
                status: existingPayment.status || 'paid',
                remarks: existingPayment.remarks || '',
                enableOnlinePayment: existingPayment.status !== 'paid'
            });
        } else {
            setPaymentForm({
                studentId: student._id,
                amount: '',
                paymentMethod: 'offline',
                status: 'paid',
                remarks: '',
                enableOnlinePayment: false
            });
        }
        
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
        setError(null);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!paymentForm.studentId) {
            toast.error('Student ID is required');
            return;
        }
        
        if (!paymentForm.amount || isNaN(paymentForm.amount) || Number(paymentForm.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        
        setSubmitting(true);
        setError(null);
        
        try {
            // Prepare request data
            const requestData = {
                studentId: paymentForm.studentId,
                amount: Number(paymentForm.amount),
                paymentMethod: paymentForm.paymentMethod,
                status: paymentForm.status,
                remarks: paymentForm.remarks || '',
                enableOnlinePayment: paymentForm.enableOnlinePayment
            };
            
            // Set appropriate remarks for pending online payments
            if (paymentForm.status === 'pending' && paymentForm.enableOnlinePayment) {
                requestData.remarks = (requestData.remarks || '') + ' (Online payment enabled)';
            }
            
            // Make API call
            const response = await axios.post(
                `${API_BASE_URL}/admin/batches/${batchId}/fees`,
                requestData
            );
            
            if (response.data.success) {
                toast.success('Fees payment record updated successfully');
                
                // Update the fees payments list
                if (Array.isArray(response.data.feesPayments)) {
                    setFeesPayments(response.data.feesPayments);
                } else {
                    // Refresh data to get updated list
                    fetchFeesData();
                }
                
                // Close the modal
                handleCloseModal();
            } else {
                throw new Error(response.data.message || 'Failed to update payment');
            }
        } catch (error) {
            console.error('Error updating fees payment:', error);
            setError(error.response?.data?.message || error.message || 'Failed to update payment');
            toast.error(error.response?.data?.message || error.message || 'Failed to update payment');
        } finally {
            setSubmitting(false);
        }
    };

    // Get payment status for a student
    const getPaymentStatus = (studentId) => {
        if (!studentId || !feesPayments || !feesPayments.length) return null;
        
        return feesPayments.find(
            payment => payment.student && payment.student._id === studentId
        ) || null;
    };

    // Get color class based on payment status
    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return `${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}`;
            case 'pending':
                return `${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-white text-yellow-800'}`;
            case 'overdue':
                return `${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-white text-red-800'}`;
            default:
                return `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-800'}`;
        }
    };

    // Get icon based on payment status
    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid':
                return <Check className="w-4 h-4 text-green-500" />;
            case 'pending':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'overdue':
                return <X className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    // Filter students based on search term
    const filteredStudents = students.filter(student => {
        if (!student || !student.name || !student.email) return false;
        
        return (
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Calculate statistics
    const calculateStats = () => {
        const totalStudents = students.length;
        const paidCount = feesPayments.filter(payment => payment.status === 'paid').length;
        const pendingCount = feesPayments.filter(payment => payment.status === 'pending').length;
        const overdueCount = feesPayments.filter(payment => payment.status === 'overdue').length;
        const notRecordedCount = totalStudents - (paidCount + pendingCount + overdueCount);
        
        const totalCollected = feesPayments
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);
            
        const pendingAmount = feesPayments
            .filter(payment => payment.status === 'pending' || payment.status === 'overdue')
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        return {
            totalStudents,
            paidCount,
            pendingCount,
            overdueCount,
            notRecordedCount,
            totalCollected,
            pendingAmount,
            paymentPercentage: totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0
        };
    };

    const stats = calculateStats();

    // Show loading spinner
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 rounded-full border-b-2 border-red-600 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Dashboard Title */}
            <div className={`${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-white'} p-5 rounded-lg shadow-md`}>
                <h2 className="flex items-center mb-2 text-2xl font-bold">
                    <DollarSign className="mr-2 text-red-600" size={24} />
                    Fees Management Dashboard
                </h2>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Track, update, and manage student fee payments efficiently
                </p>
            </div>

            {/* Statistics Cards */}
            <div className={`${!statsVisible ? 'hidden' : ''}`}>
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className={`${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-white'} rounded-lg shadow-md p-4 flex flex-col`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Collected</p>
                                <h3 className="mt-1 text-xl font-bold">₹{stats.totalCollected.toLocaleString()}</h3>
                            </div>
                            <span className={`p-2 rounded-lg ${darkMode ? 'text-green-400 bg-green-900/20' : 'text-green-800 bg-green-100'}`}>
                                <TrendingUp size={20} />
                            </span>
                        </div>
                        <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="font-medium text-green-500">{stats.paymentPercentage}% </span>
                            of students paid
                        </div>
                    </div>

                    <div className={`${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-white'} rounded-lg shadow-md p-4 flex flex-col`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pending Amount</p>
                                <h3 className="mt-1 text-xl font-bold">₹{stats.pendingAmount.toLocaleString()}</h3>
                            </div>
                            <span className={`p-2 rounded-lg ${darkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-800 bg-yellow-100'}`}>
                                <FileText size={20} />
                            </span>
                        </div>
                        <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="font-medium text-yellow-500">{stats.pendingCount + stats.overdueCount} </span>
                            payments pending
                        </div>
                    </div>

                    <div className={`${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-white'} rounded-lg shadow-md p-4 flex flex-col`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Students</p>
                                <h3 className="mt-1 text-xl font-bold">{stats.totalStudents}</h3>
                            </div>
                            <span className={`p-2 rounded-lg ${darkMode ? 'text-blue-400 bg-blue-900/20' : 'text-blue-800 bg-blue-100'}`}>
                                <UserCheck size={20} />
                            </span>
                        </div>
                        <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="font-medium text-blue-500">{stats.notRecordedCount} </span>
                            without payment records
                        </div>
                    </div>

                    <div className={`${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-white'} rounded-lg shadow-md p-4 flex flex-col`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status Breakdown</p>
                                <h3 className="mt-1 text-xl font-bold">
                                    <span className="text-green-500">{stats.paidCount}</span> / 
                                    <span className="ml-1 text-yellow-500">{stats.pendingCount}</span> / 
                                    <span className="ml-1 text-red-500">{stats.overdueCount}</span>
                                </h3>
                            </div>
                            <span className={`p-2 rounded-lg ${darkMode ? 'text-purple-400 bg-purple-900/20' : 'text-purple-800 bg-purple-100'}`}>
                                <Calendar size={20} />
                            </span>
                        </div>
                        <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Paid / Pending / Overdue
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className={`flex flex-col sm:flex-row justify-between gap-4 items-center ${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-white'} p-4 rounded-lg shadow-md`}>
                <button 
                    onClick={() => setStatsVisible(!statsVisible)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        darkMode 
                            ? 'text-white bg-gray-700 hover:bg-gray-600' 
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                    {statsVisible ? 'Hide Statistics' : 'Show Statistics'}
                </button>
                
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`pl-9 pr-4 py-2 w-full rounded-md border ${
                            darkMode 
                                ? 'text-white bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500' 
                                : 'text-gray-700 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500'
                        }`}
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
            </div>
            
            {error && (
                <div className="p-3 mb-4 text-red-800 bg-red-100 rounded-md shadow-sm dark:bg-red-900/20 dark:text-red-400">
                    <div className="flex items-center">
                        <AlertCircle className="mr-2 w-5 h-5" />
                        {error}
                    </div>
                </div>
            )}
            
            {/* Students Fees Table */}
            <div className={`${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-white'} rounded-lg shadow-md overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} text-left`}>
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold">Name</th>
                                <th className="px-6 py-3 text-sm font-semibold">Email</th>
                                <th className="px-6 py-3 text-sm font-semibold">Amount</th>
                                <th className="px-6 py-3 text-sm font-semibold">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(student => {
                                    const payment = getPaymentStatus(student._id);
                                    return (
                                        <tr key={student._id} className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                                            <td className="px-6 py-4 text-sm font-medium">{student.name}</td>
                                            <td className="px-6 py-4 text-sm">{student.email}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {payment ? 
                                                    <span className="font-medium">₹{payment.amount.toLocaleString()}</span> : 
                                                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Not recorded</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                {payment ? (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                        {getStatusIcon(payment.status)}
                                                        <span className="ml-1 capitalize">{payment.status}</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        <span className="capitalize">Not Recorded</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleOpenModal(student)}
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                                                        darkMode
                                                            ? 'bg-red-600/10 text-red-500 hover:bg-red-600/20'
                                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    } transition-colors`}
                                                >
                                                    <Edit className="w-4 h-4 mr-1.5" />
                                                    {payment ? 'Update' : 'Record Payment'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-sm text-center">
                                        {searchTerm ? 'No students found matching your search.' : 'No students enrolled in this batch.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Payment Modal */}
            {isModalOpen && selectedStudent && (
                <div className={`fixed inset-0 z-50 overflow-y-auto ${darkMode ? 'bg-gray-900 bg-opacity-75' : 'bg-black bg-opacity-50'}`}>
                    <div className="flex justify-center items-center px-4 min-h-screen">
                        <div className={`relative w-full max-w-md rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
                            <div className={`flex justify-between items-center px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r from-red-500 to-red-600`}>
                                <h3 className="text-lg font-semibold text-white">
                                    {feesPayments.some(p => p.student && p.student._id === selectedStudent._id) 
                                        ? 'Update Payment Record' 
                                        : 'Record New Payment'}
                                </h3>
                                <button 
                                    onClick={handleCloseModal}
                                    className="text-white hover:text-gray-200 focus:outline-none"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className={`px-6 py-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <p className="text-sm">
                                        <span className="font-medium">Student:</span> {selectedStudent.name}
                                    </p>
                                    <p className="mt-1 text-sm">
                                        <span className="font-medium">Email:</span> {selectedStudent.email}
                                    </p>
                                </div>
                                
                                {error && (
                                    <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-400">
                                        {error}
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={paymentForm.amount}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            className={`px-3 py-2 w-full rounded-md border ${
                                                darkMode 
                                                    ? 'text-white bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500' 
                                                    : 'text-gray-700 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500'
                                            }`}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Payment Method
                                            </label>
                                            <select
                                                name="paymentMethod"
                                                value={paymentForm.paymentMethod}
                                                onChange={handleInputChange}
                                                required
                                                className={`px-3 py-2 w-full rounded-md border ${
                                                    darkMode 
                                                        ? 'text-white bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500' 
                                                        : 'text-gray-700 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500'
                                                }`}
                                            >
                                                <option value="offline">Offline</option>
                                                <option value="online">Online</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Status
                                            </label>
                                            <select
                                                name="status"
                                                value={paymentForm.status}
                                                onChange={handleInputChange}
                                                required
                                                className={`px-3 py-2 w-full rounded-md border ${
                                                    darkMode 
                                                        ? 'text-white bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500' 
                                                        : 'text-gray-700 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500'
                                                }`}
                                            >
                                                <option value="paid">Paid</option>
                                                <option value="pending">Pending</option>
                                                <option value="overdue">Overdue</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Enable Online Payment Option - Only show for pending/overdue status */}
                                    {(paymentForm.status === 'pending' || paymentForm.status === 'overdue') && (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="enableOnlinePayment"
                                                name="enableOnlinePayment"
                                                checked={paymentForm.enableOnlinePayment}
                                                onChange={(e) => setPaymentForm(prev => ({
                                                    ...prev,
                                                    enableOnlinePayment: e.target.checked
                                                }))}
                                                className={`w-4 h-4 ${
                                                    darkMode
                                                        ? 'text-red-500 bg-gray-700 border-gray-600'
                                                        : 'text-red-600 bg-white border-gray-300'
                                                } rounded focus:ring-red-500`}
                                            />
                                            <label
                                                htmlFor="enableOnlinePayment"
                                                className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                            >
                                                Enable online payment for student
                                            </label>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className={`block mb-1 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Remarks (Optional)
                                        </label>
                                        <textarea
                                            name="remarks"
                                            value={paymentForm.remarks}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className={`px-3 py-2 w-full rounded-md border ${
                                                darkMode 
                                                    ? 'text-white bg-gray-700 border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500' 
                                                    : 'text-gray-700 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500'
                                            }`}
                                            placeholder="Add any additional notes about the payment..."
                                        ></textarea>
                                    </div>
                                    
                                    <div className="flex justify-end pt-4 space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className={`px-4 py-2 text-sm font-medium ${
                                                darkMode 
                                                    ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                            } rounded-md border`}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md border border-transparent shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <span className="flex items-center">
                                                    <span className="mr-2 w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></span>
                                                    Saving...
                                                </span>
                                            ) : (
                                                'Save Payment'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FeesManager; 