import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UserLoginPage from './pages/user/LoginPage';
import UserSignupPage from './pages/user/SignupPage';
import AdminLandingPage from './pages/AdminPage';
import TeacherLoginPage from './pages/admin/LoginPage';
import TeacherSignupPage from './pages/admin/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/login" element={<UserLoginPage />} />
        <Route path="/student/signup" element={<UserSignupPage />} />
        <Route path="/teacher" element={<AdminLandingPage />} />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/signup" element={<TeacherSignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;