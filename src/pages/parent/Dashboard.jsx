import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Calendar, Loader, GraduationCap, School } from 'lucide-react';
import axios from 'axios';
import ParentNavbar from '../../components/ParentNavbar';

function ParentDashboard() {
    const [studentBatches, setStudentBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const parentData = JSON.parse(localStorage.getItem('parentData'));
        if (!parentData || !parentData.token) {
            navigate('/user/parent-login');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:3000/user/parent/student-batches',
                    {
                        headers: {
                            'Authorization': `Bearer ${parentData.token}`
                        }
                    }
                );

                if (response.data.success) {
                    setStudentBatches(response.data.data);
                }
            } catch (err) {
                console.error('Error:', err);
                setError(err.response?.data?.message || 'Failed to fetch data');
                if (err.response?.status === 401) {
                    localStorage.removeItem('parentData');
                    navigate('/user/parent-login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
                    <p className="text-gray-600">Loading student information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ParentNavbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dashboard Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
                    <p className="text-gray-600 mt-1">Monitor your children's academic progress</p>
                </div>

                {/* Students Overview */}
                {studentBatches.map(({ student, batches }) => (
                    <div key={student.id} className="mb-12">
                        {/* Student Header */}
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{student.name}</h2>
                                <p className="text-gray-500 text-sm">{student.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center space-x-3">
                                    <School className="h-5 w-5 text-indigo-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Total Batches</p>
                                        <p className="text-2xl font-semibold text-gray-900">{batches.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Enrolled Batches</h3>
                            {batches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {batches.map(batch => (
                                        <div 
                                            key={batch._id} 
                                            className="border border-gray-200 rounded-lg hover:border-indigo-500 transition-all duration-200"
                                        >
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-medium text-gray-900">
                                                            {batch.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            Code: {batch.batch_code}
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                        Active
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Users className="h-4 w-4 mr-2" />
                                                        {batch.students.length} Students
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <BookOpen className="h-4 w-4 mr-2" />
                                                        Teacher: {batch.teacher_id?.name || 'Not assigned'}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Joined: {new Date(batch.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Batches Found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your child is not enrolled in any batches yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ParentDashboard;
