import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';

function StudentNavbar() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/student/login');
            return;
        }

        const user = JSON.parse(storedUser);
        if (user.role !== 'student') {
            localStorage.removeItem('user');
            navigate('/student/login');
            return;
        }

        setUserData(user);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/student/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                        <span className="text-2xl font-bold text-gray-900">EduCoach</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/student/batches" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                            My Batches
                        </Link>
                        <Link to="/student/materials" className="text-gray-600 hover:text-indigo-600 transition-colors duration-200">
                            Materials
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">{userData?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-600 flex items-center space-x-1"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default StudentNavbar;
