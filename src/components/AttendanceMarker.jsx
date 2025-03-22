import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Save, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useDarkMode } from '../utils/DarkModeContext';

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
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteRecordId, setDeleteRecordId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAttendanceSubmitted, setIsAttendanceSubmitted] = useState(false);
    const [existingAttendanceForDate, setExistingAttendanceForDate] = useState(null);
    const { darkMode } = useDarkMode();

    useEffect(() => {
        fetchAttendanceRecords();
    }, [batchId]);

    useEffect(() => {
        // Check if attendance exists for the selected date
        if (attendanceRecords.length > 0 && date) {
            const formattedDate = new Date(date).toISOString().split('T')[0];
            const existingRecord = attendanceRecords.find(record => 
                new Date(record.date).toISOString().split('T')[0] === formattedDate
            );
            
            if (existingRecord && !isEditing) {
                setExistingAttendanceForDate(existingRecord);
                // Map existing attendance data to the current attendance state
                const mappedAttendance = existingRecord.records.map(r => ({
                    student_id: r.student_id._id || r.student_id,
                    status: r.status,
                    remarks: r.remarks || ''
                }));
                setAttendance(mappedAttendance);
            } else if (!isEditing) {
                setExistingAttendanceForDate(null);
                // Reset attendance if no record exists for this date
                setAttendance(
                    students.map(student => ({
                        student_id: student._id,
                        status: 'present',
                        remarks: ''
                    }))
                );
            }
        }
    }, [date, attendanceRecords, isEditing]);

    const fetchAttendanceRecords = async () => {
        try {
            setLoading(true);
            const teacherData = JSON.parse(localStorage.getItem('teacherUser'));
            const response = await axios.get(
                `http://localhost:3000/admin/batches/${batchId}/attendance`,
                {
                    headers: {
                        'Authorization': `Bearer ${teacherData.id}`
                    }
                }
            );

            if (response.data.success) {
                setAttendanceRecords(response.data.attendance);
            }
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            setError(error.response?.data?.message || 'Error fetching attendance records');
        } finally {
            setLoading(false);
        }
    };

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

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setIsAttendanceSubmitted(false);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const teacherData = JSON.parse(localStorage.getItem('teacherUser'));
            
            if (isEditing && editingRecord) {
                // Update existing attendance record
                const response = await axios.put(
                    `http://localhost:3000/admin/batches/${batchId}/attendance/${editingRecord._id}`,
                    {
                        records: attendance
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${teacherData.id}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    setSuccess('Attendance updated successfully');
                    setIsEditing(false);
                    setEditingRecord(null);
                    setIsAttendanceSubmitted(true);
                    fetchAttendanceRecords();
                }
            } else if (existingAttendanceForDate) {
                // Update attendance for today that already exists
                const response = await axios.put(
                    `http://localhost:3000/admin/batches/${batchId}/attendance/${existingAttendanceForDate._id}`,
                    {
                        records: attendance
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${teacherData.id}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    setSuccess('Attendance updated successfully');
                    fetchAttendanceRecords();
                }
            } else {
                // Create new attendance record
                const response = await axios.post(
                    `http://localhost:3000/admin/batches/${batchId}/attendance`,
                    {
                        date,
                        records: attendance
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${teacherData.id}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    setSuccess('Attendance marked successfully');
                    setIsAttendanceSubmitted(true);
                    fetchAttendanceRecords();
                }
            }
        } catch (error) {
            console.error('Error with attendance:', error);
            setError(error.response?.data?.message || `Error ${isEditing ? 'updating' : 'marking'} attendance`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditAttendance = (record) => {
        setEditingRecord(record);
        setIsEditing(true);
        setDate(new Date(record.date).toISOString().split('T')[0]);
        
        // Map the existing records to the attendance state
        const mappedAttendance = record.records.map(r => ({
            student_id: r.student_id._id || r.student_id,
            status: r.status,
            remarks: r.remarks || ''
        }));
        
        // Add any missing students (in case new students were added to the batch)
        students.forEach(student => {
            if (!mappedAttendance.some(a => a.student_id === student._id)) {
                mappedAttendance.push({
                    student_id: student._id,
                    status: 'present',
                    remarks: ''
                });
            }
        });
        
        setAttendance(mappedAttendance);
    };

    const handleDeleteAttendance = async () => {
        if (!deleteRecordId) return;
        
        try {
            setDeleteLoading(true);
            const teacherData = JSON.parse(localStorage.getItem('teacherUser'));
            const response = await axios.delete(
                `http://localhost:3000/admin/batches/${batchId}/attendance/${deleteRecordId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${teacherData.id}`
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Attendance record deleted successfully');
                setShowDeleteModal(false);
                setDeleteRecordId(null);
                fetchAttendanceRecords();
            }
        } catch (error) {
            console.error('Error deleting attendance record:', error);
            setError(error.response?.data?.message || 'Error deleting attendance record');
        } finally {
            setDeleteLoading(false);
        }
    };

    const confirmDelete = (id) => {
        setDeleteRecordId(id);
        setShowDeleteModal(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingRecord(null);
        setIsAttendanceSubmitted(false);
        setDate(new Date().toISOString().split('T')[0]);
        setAttendance(
            students.map(student => ({
                student_id: student._id,
                status: 'present',
                remarks: ''
            }))
        );
    };

    return (
        <div className={darkMode ? 'text-gray-100' : 'text-gray-900'}>
            <div className="space-y-6">
                <div className="p-6 bg-white rounded-lg shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">{isEditing ? 'Edit Attendance' : 'Mark Attendance'}</h2>
                    
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 rounded-md">
                            {success}
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Date
                        </label>
                        <div className="flex space-x-4">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className={`rounded-md shadow-sm border focus:ring focus:ring-indigo-500 focus:border-indigo-500 ${
                                    darkMode 
                                        ? 'text-gray-100 bg-gray-800 border-gray-700' 
                                        : 'border-gray-300'
                                }`}
                            />
                            {existingAttendanceForDate && !isEditing ? (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditAttendance(existingAttendanceForDate)}
                                        className="inline-flex items-center px-3 py-1 text-sm font-medium leading-4 text-white bg-indigo-600 rounded-md border border-transparent hover:bg-indigo-700"
                                    >
                                        <Edit size={16} className="mr-1" /> Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(existingAttendanceForDate._id)}
                                        className="inline-flex items-center px-3 py-1 text-sm font-medium leading-4 text-white bg-red-600 rounded-md border border-transparent hover:bg-red-700"
                                    >
                                        <Trash2 size={16} className="mr-1" /> Delete
                                    </button>
                                </div>
                            ) : null}
                        </div>
                        {existingAttendanceForDate && !isEditing && (
                            <p className={`mt-2 text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                Attendance already marked for this date
                            </p>
                        )}
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                                <tr>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Student
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Status
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                        Remarks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                                {students.map((student) => {
                                    const attendanceEntry = attendance.find(
                                        a => a.student_id === student._id
                                    );
                                    const status = attendanceEntry ? attendanceEntry.status : 'present';
                                    const remarks = attendanceEntry ? attendanceEntry.remarks : '';
                                    
                                    return (
                                        <tr key={student._id}>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {student.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(student._id, 'present')}
                                                        className={`flex items-center px-2 py-1 rounded ${
                                                            status === 'present' 
                                                                ? 'bg-green-600 text-white' 
                                                                : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                                                        }`}
                                                        disabled={existingAttendanceForDate && !isEditing}
                                                    >
                                                        <Check size={14} className="mr-1" />
                                                        Present
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(student._id, 'absent')}
                                                        className={`flex items-center px-2 py-1 rounded ${
                                                            status === 'absent' 
                                                                ? 'bg-red-600 text-white' 
                                                                : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                                                        }`}
                                                        disabled={existingAttendanceForDate && !isEditing}
                                                    >
                                                        <X size={14} className="mr-1" />
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={remarks}
                                                    onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                                                    placeholder="Add remarks"
                                                    className={`border rounded-md shadow-sm px-3 py-1 focus:ring focus:ring-indigo-500 focus:border-indigo-500 ${
                                                        darkMode 
                                                            ? 'placeholder-gray-400 text-gray-100 bg-gray-700 border-gray-600' 
                                                            : 'border-gray-300'
                                                    }`}
                                                    disabled={existingAttendanceForDate && !isEditing}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex items-center mt-6">
                        {isEditing ? (
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm ${
                                        darkMode 
                                            ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600' 
                                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={loading || existingAttendanceForDate}
                            >
                                {loading ? (
                                    <>
                                        <svg className="mr-2 -ml-1 w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-2" /> Mark Attendance
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Previous Attendance Records */}
                {attendanceRecords.length > 0 && (
                    <div className="p-6 bg-white rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">Previous Attendance Records</h2>
                        <div className="overflow-x-auto">
                            <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                                    <tr>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Date
                                        </th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Present
                                        </th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Absent
                                        </th>
                                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                                    {attendanceRecords
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((record) => {
                                            const presentCount = record.records.filter(r => r.status === 'present').length;
                                            const absentCount = record.records.filter(r => r.status === 'absent').length;
                                            
                                            return (
                                                <tr key={record._id}>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                        darkMode 
                                                            ? 'text-green-400' 
                                                            : 'text-green-600'
                                                    }`}>
                                                        {presentCount}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                        darkMode 
                                                            ? 'text-red-400' 
                                                            : 'text-red-600'
                                                    }`}>
                                                        {absentCount}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditAttendance(record)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDelete(record._id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="overflow-y-auto fixed inset-0 z-50">
                    <div className="flex justify-center items-center px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="sm:flex sm:items-start">
                                    <div className="flex flex-shrink-0 justify-center items-center mx-auto w-12 h-12 bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className={`text-lg leading-6 font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                            Delete Attendance Record
                                        </h3>
                                        <div className="mt-2">
                                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                Are you sure you want to delete this attendance record? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-gray-50'}`}>
                                <button
                                    type="button"
                                    onClick={handleDeleteAttendance}
                                    className="inline-flex justify-center px-4 py-2 w-full text-base font-medium text-white bg-red-600 rounded-md border border-transparent shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className={`mt-3 w-full inline-flex justify-center rounded-md border px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm ${
                                        darkMode
                                            ? 'text-gray-300 bg-gray-700 border-gray-600 hover:bg-gray-600 focus:ring-gray-500'
                                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
                                    }`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AttendanceMarker;
