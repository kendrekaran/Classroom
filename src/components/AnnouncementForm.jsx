import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Edit, Plus } from 'lucide-react';

function AnnouncementForm({ batchId, onAnnouncementCreated, editAnnouncement = null }) {
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (editAnnouncement) {
            setFormData({
                title: editAnnouncement.title,
                content: editAnnouncement.content
            });
            setIsEditing(true);
        } else {
            setFormData({
                title: '',
                content: ''
            });
            setIsEditing(false);
        }
    }, [editAnnouncement]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const teacherUserStr = localStorage.getItem('teacherUser');
            if (!teacherUserStr) {
                throw new Error('Teacher authentication required');
            }

            const teacherUser = JSON.parse(teacherUserStr);
            
            if (isEditing && editAnnouncement) {
                // Update existing announcement
                const response = await axios.put(
                    `http://localhost:3000/admin/batches/${batchId}/announcements/${editAnnouncement._id}`,
                    {
                        ...formData,
                        teacher_id: teacherUser.id
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${teacherUser.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    setFormData({ title: '', content: '' });
                    onAnnouncementCreated(response.data.announcement, true);
                    setIsEditing(false);
                } else {
                    throw new Error(response.data.message || 'Failed to update announcement');
                }
            } else {
                // Create new announcement
                const response = await axios.post(
                    `http://localhost:3000/admin/batches/${batchId}/announcements`,
                    {
                        ...formData,
                        teacher_id: teacherUser.id
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${teacherUser.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data.success) {
                    setFormData({ title: '', content: '' });
                    onAnnouncementCreated(response.data.announcement);
                } else {
                    throw new Error(response.data.message || 'Failed to create announcement');
                }
            }
        } catch (error) {
            console.error('Announcement operation error:', error);
            setError(error.response?.data?.message || error.message || `Error ${isEditing ? 'updating' : 'creating'} announcement`);
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setFormData({ title: '', content: '' });
        setIsEditing(false);
        setError('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                    {isEditing ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                {isEditing && (
                    <button 
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content
                    </label>
                    <textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex justify-center items-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                    {isEditing ? (
                        <>
                            <Edit className="w-4 h-4 mr-2" />
                            {loading ? 'Updating...' : 'Update Announcement'}
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            {loading ? 'Creating...' : 'Create Announcement'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

export default AnnouncementForm;
