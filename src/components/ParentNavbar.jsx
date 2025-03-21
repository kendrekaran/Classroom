import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import { useDarkMode } from '../utils/DarkModeContext';

function ParentNavbar() {
    const [parentData, setParentData] = useState(null);
    const navigate = useNavigate();
    const { darkMode } = useDarkMode();

    useEffect(() => {
        const storedData = localStorage.getItem('parentData');
        if (!storedData) {
            navigate('/parent/login');
            return;
        }
        setParentData(JSON.parse(storedData));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('parentData');
        navigate('/parent/login');
    };

    return (
        <nav className={`${darkMode ? 'bg-gray-900' : 'bg-white'} ${darkMode ? 'shadow-gray-800' : 'shadow-md'}`}>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/parent/dashboard" className="flex items-center">
                            <BookOpen className="w-8 h-8 text-indigo-600" />
                            <span className={`ml-2 text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                Parent Dashboard
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <DarkModeToggle />
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{parentData?.name}</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 text-red-500 hover:text-red-600"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default ParentNavbar;
