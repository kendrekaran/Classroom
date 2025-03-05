import React, { useState } from 'react';
import axios from 'axios';
import { Check, X, Save } from 'lucide-react';

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
                        'Authorization': `Bearer ${teacherData.id}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Attendance marked successfully');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error marking attendance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
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

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
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
                        {students.map(student => (
                            <tr key={student._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {student.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAttendanceChange(student._id, 'present')}
                                            className={`p-2 rounded ${
                                                attendance.find(a => a.student_id === student._id)?.status === 'present'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            <Check className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleAttendanceChange(student._id, 'absent')}
                                            className={`p-2 rounded ${
                                                attendance.find(a => a.student_id === student._id)?.status === 'absent'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        placeholder="Add remarks"
                                        className="block w-full rounded-md border-gray-300 shadow-sm"
                                        onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                                        value={attendance.find(a => a.student_id === student._id)?.remarks || ''}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>
        </div>
    );
}

export default AttendanceMarker;
