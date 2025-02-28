import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UserLoginPage from './pages/user/LoginPage';
import UserSignupPage from './pages/user/SignupPage';
import AdminLandingPage from './pages/AdminPage';
import TeacherLoginPage from './pages/admin/LoginPage';
import TeacherSignupPage from './pages/admin/SignupPage';
import UserLoginComponent from './pages/UserLogin';
import ParentLoginPage from './pages/user/ParentLogin';
import BatchCreation from './pages/admin/BatchCreation';
import BatchesList from './pages/admin/BatchesList';
import JoinBatch from './pages/student/JoinBatch';
import StudentBatches from './pages/student/Batches';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user/login" element={<UserLoginComponent />} />
        <Route path="/parent/login" element={<ParentLoginPage />} />
        <Route path="/student/login" element={<UserLoginPage />} />
        <Route path="/user/signup" element={<UserSignupPage />} />
        <Route path="/teacher" element={<AdminLandingPage />} />
        <Route path="/teacher/login" element={<TeacherLoginPage />} />
        <Route path="/teacher/signup" element={<TeacherSignupPage />} />
        <Route path="/teacher/batches/create" element={<BatchCreation />} />
        <Route path="/teacher/batches" element={<BatchesList />} />
        <Route path="/student/join-batch" element={<JoinBatch />} />
        <Route path="/student/batches" element={<StudentBatches />} />
      </Routes>
    </Router>
  );
}

export default App;