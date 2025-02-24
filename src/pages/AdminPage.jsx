import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut } from 'lucide-react';

const teacherFeatures = [
  'Student Management',
  'Grade Tracking',
  'Curriculum Planning',
  'Resource Library'
];

function TeacherLandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('teacherToken');
    const teacherData = localStorage.getItem('teacherUser');
    
    if (token && teacherData) {
      try {
        const parsedTeacherData = JSON.parse(teacherData);
        if (parsedTeacherData) {
          setIsLoggedIn(true);
          setTeacher(parsedTeacherData);
        }
      } catch (error) {
        console.error('Error parsing teacher data:', error);
        localStorage.removeItem('teacherToken');
        localStorage.removeItem('teacherUser');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherUser');
    setIsLoggedIn(false);
    setTeacher(null);
    navigate('/teacher');
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/teacher" className="flex items-center">
            <BookOpen className="h-6 w-6 text-red-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">TeacherPortal</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn && teacher ? (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">{teacher.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/teacher/login" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/teacher/signup" 
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-red-50 p-3 rounded-full">
              <BookOpen className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
            <span className="block">Teaching Made Simple</span>
            <span className="block text-red-600">All Your Tools in One Place</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Streamline your teaching workflow with our comprehensive platform designed specifically for educators.
          </p>
          <div className="mt-8">
            {isLoggedIn ? (
              <Link 
                to="/teacher/dashboard" 
                className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                Access Dashboard
              </Link>
            ) : (
              <Link 
                to="/teacher/login" 
                className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {teacherFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{feature}</h3>
              <p className="mt-2 text-gray-600">
                Powerful tools to enhance your teaching experience and student engagement.
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-50 border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">© {new Date().getFullYear()} TeacherPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default TeacherLandingPage;