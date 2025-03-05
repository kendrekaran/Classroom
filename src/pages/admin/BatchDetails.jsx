import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, BookOpen, ArrowLeft, Mail, User, Bell, ClipboardCheck, ChartBar } from 'lucide-react';
import axios from 'axios';
import TeacherNavbar from '../../components/TeacherNavbar';
import AnnouncementForm from '../../components/AnnouncementForm';
import AttendanceMarker from '../../components/AttendanceMarker';
import StudentAttendanceDetails from '../../components/StudentAttendanceDetails';

function BatchDetails() {
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

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
    }, [batchId]);

    const handleAnnouncementCreated = (newAnnouncement) => {
        setAnnouncements([newAnnouncement, ...announcements]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Error</h2>
                    <p className="mt-2 text-gray-600">{error || 'Batch not found'}</p>
                    <Link
                        to="/teacher/batches"
                        className="mt-4 inline-flex items-center text-red-600 hover:text-red-800"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
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
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Teacher Information</h2>
                                {batch.teacher_id && (
                                    <span className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full">
                                        Active Instructor
                                    </span>
                                )}
                            </div>
                            {batch.teacher_id ? (
                                <div className="flex items-center space-x-6">
                                    <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                                        <User className="h-8 w-8 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{batch.teacher_id.name}</h3>
                                        <div className="mt-2 flex items-center text-gray-600">
                                            <Mail className="h-4 w-4 mr-2" />
                                            {batch.teacher_id.email}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-lg">
                                    <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">No teacher assigned yet</p>
                                </div>
                            )}
                        </div>

                        {/* Batch Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <Users className="h-8 w-8 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                            {batch.students?.length || 0}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Bell className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Announcements</p>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                            {batch.announcements?.length || 0}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <Calendar className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Created On</p>
                                        <h3 className="text-lg font-semibold text-gray-900 mt-1">
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
                                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                                        <Users className="h-4 w-4 mr-2" />
                                        Add Students
                                    </button>
                                </div>

                                {/* Students Table with Attendance Records */}
                                {batch.students && batch.students.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {batch.students.map((student) => (
                                                    <tr key={student._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                                    <User className="h-4 w-4 text-gray-500" />
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
                                        <div className="text-center py-12">
                                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No students yet</h3>
                                            <p className="mt-1 text-sm text-gray-500">Start by adding students to this batch.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selected Student's Attendance Details */}
                            {selectedStudent && (
                                <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Attendance Record - {selectedStudent.name}
                                        </h2>
                                        <button
                                            onClick={() => setSelectedStudent(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <StudentAttendanceDetails
                                        batchId={batchId}
                                        student={selectedStudent}
                                    />
                                </div>
                            )}
                        </div>
                    );

            case 'attendance':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <AttendanceMarker batchId={batchId} students={batch.students} />
                        </div>
                    </div>
                );

            case 'announcements':
                return (
                    <div className="space-y-6">
                        <AnnouncementForm 
                            batchId={batchId} 
                            onAnnouncementCreated={handleAnnouncementCreated}
                        />
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
                            <div className="space-y-4">
                                {announcements.map((announcement) => (
                                    <div 
                                        key={announcement._id} 
                                        className="border-l-4 border-red-500 pl-4 py-4 bg-gray-50 rounded-r-lg"
                                    >
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {announcement.title}
                                        </h3>
                                        <p className="mt-2 text-gray-600">
                                            {announcement.content}
                                        </p>
                                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(announcement.createdAt).toLocaleDateString()}
                                            <span className="mx-2">•</span>
                                            <User className="h-4 w-4 mr-1" />
                                            {announcement.teacher_id.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TeacherNavbar />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/teacher/batches"
                    className="inline-flex items-center text-red-600 hover:text-red-800 mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Batches
                </Link>

                {/* Batch Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{batch.name}</h1>
                            <p className="text-sm text-gray-500 mt-1">Batch Code: {batch.batch_code}</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
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
                            { id: 'announcements', label: 'Announcements', icon: Bell }
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
                                <tab.icon className="h-5 w-5 mr-2" />
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

export default BatchDetails;
