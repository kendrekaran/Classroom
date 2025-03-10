import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Save, Calendar, Search, Filter, Clock, AlertCircle } from 'lucide-react';

function AttendanceMarker({ batchId, students }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState(
        students.map(student => ({
            student_id: student._id,
            status: 'present',
            remarks: ''
        }))
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [existingAttendance, setExistingAttendance] = useState(null);
    const [isCheckingExisting, setIsCheckingExisting] = useState(false);

    useEffect(() => {
        // Reset attendance when students prop changes
        setAttendance(students.map(student => ({
            student_id: student._id,
            status: 'present',
            remarks: ''
        })));
    }, [students]);

    useEffect(() => {
        // Check if attendance already exists for this date
        const checkExistingAttendance = async () => {
            try {
                setIsCheckingExisting(true);
                const teacherData = JSON.parse(localStorage.getItem('teacherUser'));
                if (!teacherData) return;

                const response = await axios.get(
                    `http://localhost:3000/admin/batches/${batchId}/attendance`,
                    {
                        headers: {
                            'Authorization': `Bearer ${teacherData.token}`
                        },
                        params: {
                            date
                        }
                    }
                );

                if (response.data.success && response.data.attendance) {
                    setExistingAttendance(response.data.attendance);
                    // Pre-fill the attendance form with existing data
                    if (response.data.attendance.records && response.data.attendance.records.length > 0) {
                        const existingRecords = response.data.attendance.records;
                        setAttendance(students.map(student => {
                            const existingRecord = existingRecords.find(
                                record => record.student_id._id === student._id
                            );
                            return existingRecord || {
                                student_id: student._id,
                                status: 'present',
                                remarks: ''
                            };
                        }));
                    }
                } else {
                    setExistingAttendance(null);
                }
            } catch (error) {
                console.error('Error checking existing attendance:', error);
                setExistingAttendance(null);
            } finally {
                setIsCheckingExisting(false);
            }
        };

        if (date && batchId) {
            checkExistingAttendance();
        }
    }, [date, batchId, students]);

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => prev.map(record => 
            record.student_id === studentId 
                ? { ...record, status } 
                : record
        ));
    };

    const handleRemarkChange = (studentId, remarks) => {
        setAttendance(prev => prev.map(record => 
            record.student_id === studentId 
                ? { ...record, remarks } 
                : record
        ));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const teacherData = JSON.parse(localStorage.getItem('teacherUser'));
            const response = await axios.post(
                `http://localhost:3000/admin/batches/${batchId}/attendance`,
                {
                    date,
                    records: attendance
                },
                {
                    headers: {
                        'Authorization': `Bearer ${teacherData.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Attendance marked successfully');
                setTimeout(() => setSuccess(''), 3000);
                // Update existingAttendance state
                setExistingAttendance(response.data.attendance);
            } else {
                setError(response.data.message || 'Error marking attendance');
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            setError(error.response?.data?.message || 'Error marking attendance');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (statusFilter === 'all') return matchesSearch;
        
        const studentAttendance = attendance.find(a => a.student_id === student._id);
        return matchesSearch && studentAttendance?.status === statusFilter;
    });

    const markAllAs = (status) => {
        setAttendance(prev => prev.map(record => ({
            ...record,
            status
        })));
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
                <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                            />
                        </div>
                        {isCheckingExisting && (
                            <p className="mt-1 text-sm text-blue-500">Checking existing records...</p>
                        )}
                        {existingAttendance && (
                            <div className="mt-1 text-sm text-amber-600 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Attendance already exists for this date. Editing will update the records.
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-end space-x-2">
                        <button
                            onClick={() => markAllAs('present')}
                            className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Mark All Present
                        </button>
                        <button
                            onClick={() => markAllAs('absent')}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Mark All Absent
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">
                        {success}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                        >
                            <option value="all">All Students</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Remarks
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.map(student => {
                            const studentAttendance = attendance.find(a => a.student_id === student._id);
                            return (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-600 font-medium">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAttendanceChange(student._id, 'present')}
                                                className={`p-2 rounded-full ${
                                                    studentAttendance?.status === 'present'
                                                        ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                                                }`}
                                                title="Mark as Present"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAttendanceChange(student._id, 'absent')}
                                                className={`p-2 rounded-full ${
                                                    studentAttendance?.status === 'absent'
                                                        ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                                                }`}
                                                title="Mark as Absent"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            placeholder="Add remarks (optional)"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                            onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                                            value={studentAttendance?.remarks || ''}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                                    {searchTerm 
                                        ? "No students match your search" 
                                        : "No students to display"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : existingAttendance ? 'Update Attendance' : 'Save Attendance'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AttendanceMarker;
