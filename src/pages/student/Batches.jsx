import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, BookOpen, Users, Calendar, Search } from 'lucide-react';
import axios from 'axios';
import StudentNavbar from '../../components/StudentNavbar';

function StudentBatches() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await axios.get('http://localhost:3000/user/my-batches', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setBatches(response.data.batches);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch batches');
        } finally {
            setLoading(false);
        }
    };

    const filteredBatches = batches.filter(batch => 
        batch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <StudentNavbar />
            <div className="min-h-screen bg-gray-50 py-8 px-4">
            
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Batches</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                View and manage your enrolled batches
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Link
                                to="/student/join-batch"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <UserPlus className="h-5 w-5 mr-2" />
                                Join New Batch
                            </Link>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search batches by code or teacher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Batches Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBatches.map(batch => (
                            <div
                                key={batch.code}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {batch.code}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Teacher: {batch.teacher?.name || 'Not assigned'}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Users className="h-4 w-4 mr-2" />
                                            {batch.totalStudents} Students
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(batch.details?.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Link
                                            to={`/student/batches/${batch.code}`}
                                            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                                        >
                                            <BookOpen className="h-4 w-4 mr-1" />
                                            View Materials
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredBatches.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No batches found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? "Try adjusting your search" : "Join a batch to get started"}
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <Link
                                        to="/student/join-batch"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <UserPlus className="h-5 w-5 mr-2" />
                                        Join a Batch
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentBatches;
