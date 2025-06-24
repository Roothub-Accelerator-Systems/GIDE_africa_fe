import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import ResumeBuilder from './pages/ResumeBuilder';
import Templates from './pages/Templates';
import CoverLetter from './pages/CoverLetter';
import Login from './pages/Login';
import EmailVerification from './components/Auth/EmailVerification';
import ProfilePage from './pages/ProfilePage'; 
import Subscription from './pages/Subscription'
import SettingsPage from './pages/SettingsPage'

function App() {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Mock authentication for demo purposes
  useEffect(() => {
    // Check if user was previously logged in using localStorage
    const userLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(userLoggedIn);
  }, []);
  
  // const toggleSidebar = () => {
  //   setSidebarOpen(!sidebarOpen);
  // };
  
  const handleLogin = () => {
    // Set auth state and save to localStorage
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
  };
  
  // const handleLogout = () => {
  //   // Clear auth state and localStorage
  //   setIsAuthenticated(false);
  //   localStorage.removeItem('isLoggedIn');
  // };
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          {/* Sidebar - Only show if authenticated */}
          {/* {isAuthenticated && (
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          )} */}
          
          {/* Main Content */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top Navigation - Only show if authenticated */}
            {/* {isAuthenticated && (
              <Navbar 
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                onLogout={handleLogout}
              />
            )} */}
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              <Routes>
                {/* Home is now the default route */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/signup" element={<Login onLogin={handleLogin} />} />
                <Route 
                  path="/dashboard"
                  element={isAuthenticated ? <Dashboard /> : <Navigate to="/dashboard" />}
                />
                <Route 
                  path="/resumes"
                  element={isAuthenticated ? <Resumes /> : <Navigate to="/resumes" />}
                />
                <Route 
                  path="/resume-builder"
                  element={isAuthenticated ? <ResumeBuilder /> : <Navigate to="/resume-builder" />}
                />
                <Route 
                  path="/templates"
                  element={isAuthenticated ? <Templates /> : <Navigate to="/templates" />}
                />
                <Route 
                  path="/cover-letter"
                  element={isAuthenticated ? <CoverLetter /> : <Navigate to="/cover-letter" />}
                />
                {/* Add the new Profile route */}
                <Route 
                  path="/profile"
                  element={isAuthenticated ? <ProfilePage /> : <Navigate to="/profile" />}
                />
                <Route 
                  path="/subscription"
                  element={isAuthenticated ? <Subscription /> : <Navigate to="/subscription" />}
                />
                <Route 
                  path="/settings"
                  element={isAuthenticated ? <SettingsPage /> : <Navigate to="/settings" />}
                />
                <Route 
                  path="/verify-email"
                  element={isAuthenticated ? <EmailVerification /> : <Navigate to="/verify-email" />}
                />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;