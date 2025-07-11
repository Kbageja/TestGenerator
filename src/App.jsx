import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateTest from './pages/CreateTest';
import Tests from './pages/Tests';
import MainLayout from './layouts/Mainlayout.jsx';
import ProtectedRoute from './utils/ProtectedRoute';

import './App.css';
import TestStarter from './pages/TestStarter';
import TestRunner from './pages/TestRunner';
import TestResult from './pages/TestResult';
import SignInPage from './pages/SignIn.jsx';
import SignUpPage from './pages/SignUp.jsx';


function App() {
  return (
    <Routes>
      <Route path = "/sign-in/*" element={<SignInPage />}/>
      <Route path = "/sign-up/*" element={<SignUpPage />}/>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route
          path="Dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="CreateTest"
          element={
            <ProtectedRoute>
              <CreateTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="Tests"
          element={
            <ProtectedRoute>
              <Tests />
            </ProtectedRoute>
          }
        />
        <Route
          path="Test/:id"
          element={
            <ProtectedRoute>
              <TestStarter />
            </ProtectedRoute>
          }
        />
        <Route
          path="Test/:id/Start"
          element={
            <ProtectedRoute>
              <TestRunner />
            </ProtectedRoute>
          }
        />
        <Route
          path="Test/Result/:id"
          element={
            <ProtectedRoute>
              <TestResult />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;


