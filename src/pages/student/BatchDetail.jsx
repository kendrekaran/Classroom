import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, BookOpen, ArrowLeft, Mail, User, Bell, ClipboardCheck } from 'lucide-react';
import axios from 'axios';
import StudentNavbar from '../../components/StudentNavbar';
import StudentAttendance from '../../components/StudentAttendance';
import TimetableViewer from '../../components/TimetableViewer';

function StudentBatchDetail() {
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchBatchDetails = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    navigate('/user/login');
                    return;
                }

                const userData = JSON.parse(userStr);
                console.log('Fetching batch details:', {
                    batchId,
                    userData
                });

                const response = await axios.get(
                    `http://localhost:3000/user/student/batches/${batchId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${userData.token}`
                        },
                        params: {
                            userId: userData.id
                        }
                    }
                );

                console.log('Batch details response:', response.data);

                if (response.data.success) {
                    setBatch(response.data.batch);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch batch details');
                }
            } catch (error) {
                console.error('Error fetching batch details:', error.response?.data || error);
                setError(error.response?.data?.message || 'Failed to fetch batch details');
            } finally {
                setLoading(false);
            }
        };

        if (batchId) {
            fetchBatchDetails();
        }
    }, [batchId, navigate]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* Teacher Information */}
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Teacher Information</h2>
                            {batch.teacher ? (
                                <div className="flex items-center space-x-4">
                                    <div className="flex justify-center items-center w-12 h-12 bg-indigo-100 rounded-full">
                                        <User className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-md">{batch.teacher.name}</h3>
                                        <div className="flex items-center mt-1 text-sm text-gray-500">
                                            <Mail className="mr-1 w-4 h-4" />
                                            {batch.teacher.email}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">No teacher assigned</p>
                            )}
                        </div>

                        {/* Batch Statistics */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="p-6 bg-white rounded-lg shadow-sm">
                                <div className="flex items-center">
                                    <Users className="w-10 h-10 text-indigo-600" />
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
                                        <p className="text-3xl font-bold text-indigo-600">{batch.studentsCount}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-white rounded-lg shadow-sm">
                                <div className="flex items-center">
                                    <Bell className="w-10 h-10 text-green-600" />
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Announcements</h3>
                                        <p className="text-3xl font-bold text-green-600">{batch.announcements?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-white rounded-lg shadow-sm">
                                <div className="flex items-center">
                                    <Calendar className="w-10 h-10 text-purple-600" />
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Joined On</h3>
                                        <p className="text-lg text-purple-600">
                                            {new Date(batch.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'attendance':
                return (
                    <div className="space-y-6">
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <StudentAttendance batchId={batchId} />
                        </div>
                    </div>
                );

            case 'announcements':
                return (
                    <div className="p-6 bg-white rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">Announcements</h2>
                        <div className="space-y-4">
                            {batch.announcements && batch.announcements.length > 0 ? (
                                batch.announcements.map((announcement, index) => (
                                    <div key={index} className="py-2 pl-4 border-l-4 border-indigo-500">
                                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                                        <p className="mt-1 text-gray-600">{announcement.content}</p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Posted by {announcement.teacher_id?.name} on{' '}
                                            {new Date(announcement.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No announcements yet</p>
                            )}
                        </div>
                    </div>
                );

            case 'timetable':
                return (
                    <div className="space-y-6">
                        <TimetableViewer batchId={batchId} />
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 rounded-full border-b-2 border-indigo-600 animate-spin"></div>
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Error</h2>
                    <p className="mt-2 text-gray-600">{error || 'Batch not found'}</p>
                    <Link
                        to="/student/batches"
                        className="inline-flex items-center mt-4 text-indigo-600 hover:text-indigo-800"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to My Batches
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <StudentNavbar />
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/student/batches"
                    className="inline-flex items-center mb-6 text-indigo-600 hover:text-indigo-800"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to My Batches
                </Link>

                {/* Batch Header */}
                <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{batch.name}</h1>
                            <p className="mt-1 text-sm text-gray-500">Batch Code: {batch.batch_code}</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        {[
                            { id: 'overview', label: 'Overview', icon: BookOpen },
                            { id: 'attendance', label: 'My Attendance', icon: ClipboardCheck },
                            { id: 'announcements', label: 'Announcements', icon: Bell },
                            { id: 'timetable', label: 'Timetable', icon: Calendar }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                                    activeTab === tab.id
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <tab.icon className="mr-2 w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </div>
    );
}

export default StudentBatchDetail;
