import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, BookOpen, ArrowLeft, Mail, User, Bell, ClipboardCheck, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import TeacherNavbar from '../../components/TeacherNavbar';
import AnnouncementForm from '../../components/AnnouncementForm';
import AttendanceMarker from '../../components/AttendanceMarker';
import StudentAttendanceDetails from '../../components/StudentAttendanceDetails';
import TimetableManager from '../../components/TimetableManager';

function BatchDetails() {
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const [deleteItemType, setDeleteItemType] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchBatchDetails();
    }, [batchId]);

    const fetchBatchDetails = async () => {
        try {
            const teacherData = localStorage.getItem('teacherUser');
            if (!teacherData) {
                navigate('/teacher/login');
                return;
            }

            const { token } = JSON.parse(teacherData);
            const response = await axios.get(`http://localhost:3000/admin/batches/${batchId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Batch details response:', response.data); // Debug log

            if (response.data?.success) {
                setBatch(response.data.batch);
            } else {
                setError('Failed to fetch batch details');
            }
        } catch (error) {
            console.error('Error fetching batch details:', error);
            setError(error.response?.data?.message || 'Failed to fetch batch details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const teacherData = localStorage.getItem('teacherUser');
                if (!teacherData) {
                    navigate('/teacher/login');
                    return;
                }

                const { token } = JSON.parse(teacherData);
                const response = await axios.get(
                    `http://localhost:3000/admin/batches/${batchId}/announcements`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                if (response.data.success) {
                    setAnnouncements(response.data.announcements);
                }
            } catch (error) {
                console.error('Error fetching announcements:', error);
            }
        };

        fetchAnnouncements();
    }, [batchId, navigate]);

    const handleAnnouncementCreated = (newAnnouncement) => {
        setAnnouncements([newAnnouncement, ...announcements]);
    };

    const handleAnnouncementUpdated = (updatedAnnouncement) => {
        setAnnouncements(announcements.map(announcement => 
            announcement._id === updatedAnnouncement._id ? updatedAnnouncement : announcement
        ));
        setSelectedAnnouncement(null);
    };

    const handleDeleteAnnouncement = async () => {
        if (!deleteItemId || deleteItemType !== 'announcement') return;
        
        setDeleteLoading(true);
        try {
            const teacherData = JSON.parse(localStorage.getItem('teacherUser'));
            const response = await axios.delete(
                `http://localhost:3000/admin/batches/${batchId}/announcements/${deleteItemId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${teacherData.id}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setAnnouncements(announcements.filter(announcement => announcement._id !== deleteItemId));
                setShowDeleteModal(false);
                setDeleteItemId(null);
                setDeleteItemType(null);
            }
        } catch (error) {
            console.error('Error deleting announcement:', error);
            setError(error.response?.data?.message || 'Error deleting announcement');
        } finally {
            setDeleteLoading(false);
        }
    };

    const confirmDelete = (id, type) => {
        setDeleteItemId(id);
        setDeleteItemType(type);
        setShowDeleteModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 rounded-full border-b-2 border-red-600 animate-spin"></div>
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
                        to="/teacher/batches"
                        className="inline-flex items-center mt-4 text-red-600 hover:text-red-800"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Batches
                    </Link>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8">
                        {/* Teacher Information */}
                        <div className="p-8 bg-white rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Teacher Information</h2>
                                {batch.teacher_id && (
                                    <span className="px-3 py-1 text-sm text-green-700 bg-green-50 rounded-full">
                                        Active Instructor
                                    </span>
                                )}
                            </div>
                            {batch.teacher_id ? (
                                <div className="flex items-center space-x-6">
                                    <div className="flex justify-center items-center w-16 h-16 bg-red-50 rounded-full">
                                        <User className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{batch.teacher_id.name}</h3>
                                        <div className="flex items-center mt-2 text-gray-600">
                                            <Mail className="mr-2 w-4 h-4" />
                                            {batch.teacher_id.email}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center bg-gray-50 rounded-lg">
                                    <User className="mx-auto mb-2 w-12 h-12 text-gray-400" />
                                    <p className="text-gray-500">No teacher assigned yet</p>
                                </div>
                            )}
                        </div>

                        {/* Batch Statistics */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="p-6 bg-white rounded-xl shadow-sm transition-shadow duration-200 hover:shadow-md">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <Users className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                                        <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                            {batch.students?.length || 0}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-white rounded-xl shadow-sm transition-shadow duration-200 hover:shadow-md">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Bell className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Announcements</p>
                                        <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                            {batch.announcements?.length || 0}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-white rounded-xl shadow-sm transition-shadow duration-200 hover:shadow-md">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <Calendar className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Created On</p>
                                        <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                            {new Date(batch.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'students':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900">Enrolled Students</h2>
                                    <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md border border-transparent hover:bg-red-700">
                                        <Users className="mr-2 w-4 h-4" />
                                        Add Students
                                    </button>
                                </div>

                                {/* Students Table */}
                                {batch.students && batch.students.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Name</th>
                                                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Email</th>
                                                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {batch.students.map((student) => (
                                                    <tr key={student._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex justify-center items-center w-8 h-8 bg-gray-100 rounded-full">
                                                                    <User className="w-4 h-4 text-gray-500" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {student.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{student.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => setSelectedStudent(student)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                View Attendance
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center bg-gray-50 rounded-lg">
                                        <Users className="mx-auto mb-2 w-12 h-12 text-gray-400" />
                                        <p className="text-gray-500">No students enrolled yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'attendance':
                return (
                    <div className="space-y-6">
                        {selectedStudent ? (
                            <StudentAttendanceDetails 
                                student={selectedStudent} 
                                batchId={batchId}
                                onBack={() => setSelectedStudent(null)}
                            />
                        ) : (
                            <AttendanceMarker 
                                batchId={batchId}
                                students={batch.students || []}
                            />
                        )}
                    </div>
                );
            case 'announcements':
                return (
                    <div className="space-y-6">
                        <AnnouncementForm 
                            batchId={batchId}
                            onAnnouncementCreated={handleAnnouncementCreated}
                            announcementToEdit={selectedAnnouncement}
                            onAnnouncementUpdated={handleAnnouncementUpdated}
                            onCancelEdit={() => setSelectedAnnouncement(null)}
                        />
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">Recent Announcements</h2>
                            <div className="space-y-4">
                                {announcements.length > 0 ? (
                                    announcements.map((announcement) => (
                                        <div 
                                            key={announcement._id} 
                                            className="py-4 pl-4 pr-3 bg-gray-50 rounded-r-lg border-l-4 border-red-500 relative"
                                        >
                                            <div className="absolute top-3 right-3 flex space-x-2">
                                                <button 
                                                    onClick={() => setSelectedAnnouncement(announcement)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Edit announcement"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(announcement._id, 'announcement')}
                                                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete announcement"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 pr-16">
                                                {announcement.title}
                                            </h3>
                                            <p className="mt-2 text-gray-600">
                                                {announcement.content}
                                            </p>
                                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                                <Calendar className="mr-1 w-4 h-4" />
                                                {new Date(announcement.createdAt).toLocaleDateString()}
                                                <span className="mx-2">•</span>
                                                <User className="mr-1 w-4 h-4" />
                                                {announcement.teacher_id.name}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center bg-gray-50 rounded-lg">
                                        <Bell className="mx-auto mb-2 w-12 h-12 text-gray-400" />
                                        <p className="text-gray-500">No announcements yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'timetable':
                return (
                    <div className="space-y-6">
                        <TimetableManager batchId={batchId} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TeacherNavbar />
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/teacher/batches"
                    className="inline-flex items-center mb-6 text-red-600 hover:text-red-800"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Back to Batches
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
                            { id: 'students', label: 'Students', icon: Users },
                            { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
                            { id: 'announcements', label: 'Announcements', icon: Bell },
                            { id: 'timetable', label: 'Timetable', icon: Calendar }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                                    activeTab === tab.id
                                        ? 'bg-red-100 text-red-700'
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center mb-4 text-red-600">
                            <AlertCircle className="w-6 h-6 mr-2" />
                            <h3 className="text-lg font-medium">Confirm Deletion</h3>
                        </div>
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to delete this {deleteItemType}? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteItemId(null);
                                    setDeleteItemType(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteItemType === 'announcement') {
                                        handleDeleteAnnouncement();
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-70"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BatchDetails;
