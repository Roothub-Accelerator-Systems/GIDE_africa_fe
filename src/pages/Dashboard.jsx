import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  FileText, 
  Briefcase, 
  Clock, 
  Edit, 
  Download, 
  Share2, 
  Trash2,
  Plus,
  ChevronRight
} from 'lucide-react';

// Import shared components
import Navbar from '../components/Shared/Navbar';
import Sidebar from '../components/Shared/Sidebar';
import ApiService from '../components/Auth/ApiService';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const navigate = useNavigate();

  // Mock data for resumes
  const resumes = [
    { 
      id: 1, 
      title: 'Software Developer Resume', 
      lastModified: '2 days ago', 
      template: 'Modern', 
      jobApplications: 4
    },
    { 
      id: 2, 
      title: 'Product Manager', 
      lastModified: '1 week ago', 
      template: 'Professional', 
      jobApplications: 2
    },
    { 
      id: 3, 
      title: 'UX Designer Resume', 
      lastModified: '3 weeks ago', 
      template: 'Creative', 
      jobApplications: 7
    }
  ];

  // Quick stats
  const stats = [
    { title: 'Active Resumes', value: 3, icon: <FileText size={24} /> },
    { title: 'Applications', value: 13, icon: <Briefcase size={24} /> },
    { title: 'Last Updated', value: '2 days ago', icon: <Clock size={24} /> },
  ];

  const handleResumeBuilder = () => {
    navigate('/resume-builder');
  };

  const handleCoverLetter = () => {
    navigate('/cover-letter');
  };

  // Load user data from backend on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (ApiService.isAuthenticated()) {
          console.log('Fetching user data from backend...');
          const user = await ApiService.getCurrentUser();
          console.log('Received user data');
          
          setUserData({
            fullName: user.username || user.full_name || user.name || user.fullName || '',
            email: user.email || '',
          });

          // Check if this is a first-time user based on various indicators
          // You can modify this logic based on your backend data structure
          const isNewUser = user.is_new_user || user.first_login || user.created_recently || false;
          setIsFirstTimeUser(isNewUser);
          
        } else {
          console.log('User not authenticated, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        console.error('Error details:', error.message);
        
        // If token is invalid, clear it and redirect to login
        if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
          console.log('Token invalid, clearing and redirecting to login');
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Get first name from full name
  const getFirstName = () => {
    if (userData.fullName) {
      const nameParts = userData.fullName.trim().split(' ');
      return nameParts[0] || 'User';
    }
    return userData.email ? userData.email.split('@')[0] : 'User';
  };

  // Get welcome message based on user status
  const getWelcomeMessage = () => {
    const firstName = getFirstName();
    return isFirstTimeUser ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}!`;
  };

  // Get welcome description based on user status
  const getWelcomeDescription = () => {
    return isFirstTimeUser 
      ? "Let's get started with creating your first professional resume"
      : "Here's a summary of your resume activities";
  };

  // Animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div 
            className="max-w-7xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerAnimation}
          >
            {/* Welcome Section */}
            <motion.div 
              className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6"
              variants={itemAnimation}
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getWelcomeMessage()}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {getWelcomeDescription()}
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              variants={itemAnimation}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.title}</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Resume List */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
              variants={itemAnimation}
            >
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Resumes</h2>
                <motion.button
                  onClick={handleResumeBuilder}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md w-full sm:w-auto"
                >
                  <Plus size={16} className="mr-1" />
                  Create New
                </motion.button>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {resumes.map((resume) => (
                  <motion.div 
                    key={resume.id}
                    className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                          <FileText size={20} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{resume.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <p className="mr-4">Template: {resume.template}</p>
                            <p>Last modified: {resume.lastModified}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Download"
                        >
                          <Download size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          title="Share"
                        >
                          <Share2 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-4">
                      {/* Resume Info */}
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex-shrink-0">
                          <FileText size={20} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{resume.title}</h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p>Template: {resume.template}</p>
                            <p>Last modified: {resume.lastModified}</p>
                          </div>
                        </div>
                      </div>

                      {/* Job Applications Badge */}
                      <div className="flex justify-start">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {resume.jobApplications} Applications
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Edit size={18} />
                          <span className="text-xs mt-1">Edit</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Download size={18} />
                          <span className="text-xs mt-1">Download</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Share2 size={18} />
                          <span className="text-xs mt-1">Share</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={18} />
                          <span className="text-xs mt-1">Delete</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Applications badge for desktop (moved outside the conditional) */}
                    <div className="hidden md:block mt-3 pl-12">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {resume.jobApplications} Applications
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Tools and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* AI Tools */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                variants={itemAnimation}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Tools</h2>
                <div className="space-y-4">
                  <motion.button
                    onClick={handleCoverLetter}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="w-full p-4 bg-blue-50 dark:bg-gray-700 rounded-lg text-left flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400 mr-3">
                        <FilePlus size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Generate Cover Letter</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create custom cover letters with AI</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="w-full p-4 bg-blue-50 dark:bg-gray-700 rounded-lg text-left flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400 mr-3">
                        <Edit size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Improve Resume</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Get AI suggestions to enhance your resume</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                variants={itemAnimation}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">Resume updated</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Software Developer Resume - 2 days ago</p>
                  </div>
                  <div className="border-l-2 border-green-500 pl-4 py-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">Cover letter generated</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">For Frontend Developer at Tech Co - 3 days ago</p>
                  </div>
                  <div className="border-l-2 border-purple-500 pl-4 py-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">Resume downloaded</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">UX Designer Resume - 1 week ago</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;