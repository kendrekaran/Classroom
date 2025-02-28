import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import axios from 'axios';
import TeacherNavbar from '../../components/TeacherNavbar';

function BatchCreation() {
    const [formData, setFormData] = useState({
        batch_code: '',
        teacher_id: ''
    });
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/admin/teachers');
            if (response.data?.success) {
                setAvailableTeachers(response.data.teachers);
            }
        } catch (error) {
            setError('Failed to fetch teachers: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(
                'http://localhost:3000/admin/batches',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data?.success) {
                setSuccess('Batch created successfully!');
                setTimeout(() => navigate('/teacher/batches'), 2000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create batch');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div>
            <TeacherNavbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-red-600 px-6 py-4">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-md">
                                <User className="h-8 w-8 text-red-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white text-center">Create New Batch</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        
                        {success && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                                {success}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Batch Code
                                </label>
                                <input
                                    type="text"
                                    name="batch_code"
                                    value={formData.batch_code}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Enter unique batch code (e.g., BATCH001)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Teacher
                                </label>
                                <select
                                    name="teacher_id"
                                    value={formData.teacher_id}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="">Select a teacher</option>
                                    {availableTeachers.map(teacher => (
                                        <option key={teacher._id} value={teacher._id}>
                                            {teacher.name} ({teacher.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors
                                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating...' : 'Create Batch'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default BatchCreation;