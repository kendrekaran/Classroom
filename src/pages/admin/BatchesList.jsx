import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, BookOpen, Search, RefreshCcw, Trash2, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import TeacherNavbar from '../../components/TeacherNavbar';

function BatchesList() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Get teacher info from localStorage
        const teacherData = localStorage.getItem('teacherUser');
        if (teacherData) {
            setCurrentTeacher(JSON.parse(teacherData));
        }
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get('http://localhost:3000/admin/batches');
            if (response.data?.success) {
                // Filter batches to only show those created by the logged-in teacher
                const teacherData = localStorage.getItem('teacherUser');
                if (teacherData) {
                    const teacher = JSON.parse(teacherData);
                    const teacherBatches = response.data.batches.filter(
                        batch => batch.teacher_id?._id === teacher.id
                    );
                    setBatches(teacherBatches);
                } else {
                    setBatches([]);
                }
            }
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch batches');
            setLoading(false);
        }
    };

    const handleDeleteBatch = async (batchId) => {
        try {
            setDeleteLoading(true);
            const teacherData = localStorage.getItem('teacherUser');
            if (!teacherData) {
                setError('Authentication required');
                return;
            }

            const { token } = JSON.parse(teacherData);
            const response = await axios.delete(
                `http://localhost:3000/admin/batches/${batchId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                // Remove the batch from state
                setBatches(batches.filter(batch => batch._id !== batchId));
                setSuccessMessage('Batch deleted successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError('Failed to delete batch: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error deleting batch:', error);
            setError(error.response?.data?.message || 'Failed to delete batch');
        } finally {
            setDeleteLoading(false);
            setDeleteConfirm(null);
        }
    };

    const handleUpdateBatchStatus = async (batchId, newStatus) => {
        try {
            setLoading(true);
            const teacherData = localStorage.getItem('teacherUser');
            if (!teacherData) {
                setError('Authentication required');
                return;
            }

            const { token } = JSON.parse(teacherData);
            const response = await axios.patch(
                `http://localhost:3000/admin/batches/${batchId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                // Update the batch status in state
                setBatches(batches.map(batch => 
                    batch._id === batchId ? { ...batch, status: newStatus } : batch
                ));
                setSuccessMessage(`Batch status updated to ${newStatus}`);
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError('Failed to update batch status: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error updating batch status:', error);
            setError(error.response?.data?.message || 'Failed to update batch status');
        } finally {
            setLoading(false);
        }
    };

    const filteredBatches = batches.filter(batch => {
        const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            batch.batch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            batch.teacher_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        return matchesSearch && batch.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && batches.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div>
            <TeacherNavbar />
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage your classroom batches and students
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Link
                                to="/teacher/batches/create"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create New Batch
                            </Link>
                        </div>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex justify-between items-center">
                            <span>{successMessage}</span>
                            <button onClick={() => setSuccessMessage('')} className="text-green-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Search and Filter */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search batches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="all">All Batches</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                                onClick={fetchBatches}
                                className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50"
                                disabled={loading}
                            >
                                <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="text-red-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {!currentTeacher ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">Authentication Required</h3>
                            <p className="mt-2 text-gray-500">Please log in to view your batches</p>
                        </div>
                    ) : (
                        <>
                            {/* Batches Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBatches.map(batch => (
                                    <div key={batch._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {batch.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">Code: {batch.batch_code}</p>
                                                    <p className="text-sm text-gray-500">Class: {batch.class}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Teacher: {currentTeacher?.name || 'Not assigned'}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                                                    {batch.status || 'Unknown'}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                                <Users className="h-4 w-4 mr-2" />
                                                {batch.students?.length || 0} Students
                                            </div>

                                            <div className="mt-6 flex justify-between items-center">
                                                <Link
                                                    to={`/teacher/batches/${batch._id}`}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    View Details →
                                                </Link>
                                                <div className="flex space-x-2">
                                                    <div className="relative">
                                                        <select
                                                            value={batch.status || 'active'}
                                                            onChange={(e) => handleUpdateBatchStatus(batch._id, e.target.value)}
                                                            className="text-sm border border-gray-300 rounded-md px-2 py-1"
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => setDeleteConfirm(batch._id)}
                                                        className="inline-flex items-center p-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Delete Confirmation */}
                                            {deleteConfirm === batch._id && (
                                                <div className="mt-4 p-3 bg-red-50 rounded-md">
                                                    <p className="text-sm text-red-700 mb-2 flex items-center">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        Delete this batch? This action cannot be undone.
                                                    </p>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDeleteBatch(batch._id)}
                                                            disabled={deleteLoading}
                                                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            {deleteLoading ? 'Deleting...' : 'Confirm'}
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State - Updated message */}
                            {filteredBatches.length === 0 && (
                                <div className="text-center py-12">
                                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        {searchTerm || filter !== 'all'
                                            ? "No matching batches found" 
                                            : "You haven't created any batches yet"}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm || filter !== 'all'
                                            ? "Try adjusting your search or filter" 
                                            : "Create your first batch to get started"}
                                    </p>
                                    {!searchTerm && filter === 'all' && (
                                        <div className="mt-6">
                                            <Link
                                                to="/teacher/batches/create"
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                            >
                                                <Plus className="h-5 w-5 mr-2" />
                                                Create New Batch
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BatchesList;
