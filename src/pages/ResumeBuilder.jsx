import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Star,
  MessageSquareText, 
  Lightbulb, 
  Wand2,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Download,
  Share2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Upload
} from 'lucide-react';

// Import shared components
import Navbar from '../components/Shared/Navbar';
import Sidebar from '../components/Shared/Sidebar';
import ResumeForm from '../components/Resume/ResumeForm';
import ResumePreview from '../components/Resume/ResumePreview';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import ShareModal from '../components/Shared/ShareModal';
import ApiService from '../components/Auth/ApiService';

const ResumeBuilder = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenLoading, setFullscreenLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewData, setPreviewData] = useState({});

  // State variables for user ID and resume version ID
  const [userId, setUserId] = useState(null);
  const [resumeVersionId, setResumeVersionId] = useState(null);
  const [initializationComplete, setInitializationComplete] = useState(false);

  const [sectionData, setSectionData] = useState({
    personal: {},
    skills: {},
    experience: {},
    education: {},
    summary: {}
  });
  const [savedSections, setSavedSections] = useState(new Set());

  // Initialize resume on component mount
  useEffect(() => {
    initializeResume();
  }, []);

  // Initialize resume by creating a new resume version
  const initializeResume = async () => {
    try {
      setIsLoading(true);
      
      // First, get the user ID from authentication or storage
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        console.error('No user ID found');
        return;
      }
      
      setUserId(currentUserId);
      
      // Create a new resume version
      const resumeData = {
        title: `Resume - ${new Date().toLocaleDateString()}`,
        user_id: currentUserId
      };
      
      const response = await ApiService.resumebuilder('/resume/create-resume', 'POST', resumeData);
      
      if (response.success && response.data) {
        const newResumeVersionId = response.data.resume_version_id || response.data.id;
        setResumeVersionId(newResumeVersionId);
        setInitializationComplete(true);
        console.log('Resume initialized with ID:', newResumeVersionId);
      } else {
        console.error('Failed to create resume:', response.error);
      }
    } catch (error) {
      console.error('Error initializing resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current user ID - you'll need to implement this based on your auth system
  const getCurrentUserId = async () => {
    try {
      // This should get the user ID from your authentication system
      // For example, from localStorage, context, or API call
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.user_id || parsedData.id;
      }
      
      // Alternative: Make API call to get current user
      const userResponse = await ApiService.makeRequest('/auth/me', { method: 'GET' });
      if (userResponse.success) {
        return userResponse.data.user_id || userResponse.data.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  // Callback functions for sidebar
  const handleUserIdFetched = (fetchedUserId) => {
    setUserId(fetchedUserId);
    console.log('User ID fetched:', fetchedUserId);
  };

  const handleResumeVersionCreated = (versionId) => {
    setResumeVersionId(versionId);
    console.log('Resume version ID created:', versionId);
  };

  useEffect(() => {
    // Only fetch data for the current active section when it changes
    if (initializationComplete && resumeVersionId) {
      fetchSectionData(activeSection);
    }
  }, [activeSection, resumeVersionId, initializationComplete]);

  const fetchSectionData = async (sectionName) => {
    // Wait for initialization to complete
    if (!resumeVersionId || !userId) {
      console.log('Waiting for initialization...');
      return;
    }

    // Skip if we already have data for this section
    if (sectionData[sectionName] && Object.keys(sectionData[sectionName]).length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Map section names to API endpoints
      const endpointMap = {
        'personal': 'personal-info',
        'skills': 'skills',
        'experience': 'experience', 
        'education': 'education',
        'summary': 'summary'
      };

      const endpoint = endpointMap[sectionName];
      if (!endpoint) return;

      // Use POST request with appropriate payload to fetch existing data
      const response = await ApiService.resumebuilder(`/resume/${endpoint}`, 'POST', {
        resume_version_id: resumeVersionId,
        user_id: userId,
        action: "fetch"
      });
      
      if (response.success && response.data) {
        setSectionData(prev => ({
          ...prev,
          [sectionName]: response.data
        }));
        setSavedSections(prev => new Set(prev).add(sectionName));
      } else {
        console.log(`No existing data for ${sectionName}:`, response.error || 'No data available');
      }
    } catch (error) {
      console.error(`Error fetching ${sectionName} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle section save function
  const handleSectionSave = async (sectionName, data) => {
    try {
      setIsLoading(true);
      
      // Map section names to API endpoints
      const endpointMap = {
        'personal': 'personal-info',
        'skills': 'skills',
        'experience': 'experience', 
        'education': 'education',
        'summary': 'summary'
      };
      
      // Transform data based on section type
      let transformedData = data;
      
      if (sectionName === 'personal') {
        // Data is already transformed in ResumeForm
        transformedData = data;
      } else if (sectionName === 'skills') {
        transformedData = {
          resume_version_id: resumeVersionId,
          user_id: userId,
          skills: data.skills || ""
        };
      } else if (sectionName === 'experience') {
        transformedData = {
          resume_version_id: resumeVersionId,
          user_id: userId,
          experiences: data.items || []
        };
      } else if (sectionName === 'education') {
        transformedData = {
          resume_version_id: resumeVersionId,
          user_id: userId,
          educations: data.items || []
        };
      } else if (sectionName === 'summary') {
        transformedData = {
          resume_version_id: resumeVersionId,
          user_id: userId,
          summary: data.summary || ""
        };
      }
      
      const endpoint = `/resume/${endpointMap[sectionName]}`;
      console.log('Sending data to API:', transformedData);
      
      const response = await ApiService.resumebuilder(endpoint, 'POST', transformedData);
      
      if (response.success) {
        setSectionData(prev => ({
          ...prev,
          [sectionName]: data
        }));
        setSavedSections(prev => new Set(prev).add(sectionName));
        
        handleUpdatePreview({
          ...sectionData,
          [sectionName]: data
        });
        
        console.log(`${sectionName} section saved successfully`);
      } else {
        console.error(`Failed to save ${sectionName}:`, response.error);
        alert(`Failed to save ${sectionName}. Please try again.`);
      }
    } catch (error) {
      console.error(`Error saving ${sectionName} section:`, error);
      alert(`Error saving ${sectionName}. Please check your connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverallSave = async () => {
    try {
      setIsLoading(true);
      
      const completeResumeData = {
        ...formData,
        ...sectionData,
        template: activeTemplate,
        resume_version_id: resumeVersionId, // ADD RESUME VERSION ID
        user_id: userId // ADD USER ID
      };
      
      const response = await ApiService.resumebuilder('/resume/save-resume', 'POST', completeResumeData);
      
      if (response.success) {
        console.log('Resume saved successfully');
      }
    } catch (error) {
      console.error('Error saving complete resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update preview handler
  const handleUpdatePreview = (data) => {
    const mergedData = {
      ...sectionData,
      ...data
    };
    setPreviewData(mergedData);
    console.log("Updated preview data:", mergedData);
  };
  
  const [formData,] = useState({
    personal: {},
    summary: {},
    education: [{}],
    skills: []
  });

  // Mock template data
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const templates = ['modern', 'professional', 'creative', 'minimal'];

  // Animation variants
  const sectionAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const aiPanelAnimation = {
    hidden: { opacity: 0, x: '100%' },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { 
      opacity: 0, 
      x: '100%',
      transition: { duration: 0.2 }
    }
  };

  // Show share modal with loading animation
  const handleShareClick = () => {
    setIsShareLoading(true);
    
    setTimeout(() => {
      setIsShareLoading(false);
      setShareModalOpen(true);
    }, 800);
  };

  // Handle share link generation callback
  const handleShareLink = (link) => {
    setShareLink(link);
    console.log("Generated share link:", link);
  };

  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File uploaded:", file.name);
    }
  };

  // Toggle file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Toggle fullscreen preview
  const toggleFullscreenPreview = () => {
    setFullscreenLoading(true);
    setTimeout(() => {
      setIsFullscreen(!isFullscreen);
      setFullscreenLoading(false);
    }, 500);
  };

  // Sections for navigation
  const sections = [
    { id: 'personal', name: 'Personal Info', icon: <User size={20} /> },
    { id: 'skills', name: 'Skills', icon: <Star size={20} /> },
    { id: 'experience', name: 'Experience', icon: <Briefcase size={20} /> },
    { id: 'education', name: 'Education', icon: <GraduationCap size={20} /> },
    { id: 'summary', name: 'Summary', icon: <MessageSquareText size={20} /> },  
  ];

  // Preview display and hide handlers
  const handleDisplayPreview = () => {
    setShowPreview(!showPreview);
  };

  // Handle download click
  const handleDownloadClick = () => {
    console.log("Downloading resume...");
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 pt-7 overflow-hidden">
        {/* UPDATE SIDEBAR WITH NEW CALLBACK PROPS */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onUserIdFetched={handleUserIdFetched}
          onResumeVersionCreated={handleResumeVersionCreated}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-1 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Builder</h1>
                <p className="text-gray-600 dark:text-gray-300">Create and customize your professional resume</p>
              </motion.div>
              
              <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-md shadow-sm"
                  onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                >
                  <Wand2 size={16} className="mr-2 text-purple-500" />
                  AI Assistant
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 1000);
                    handleOverallSave();
                  }}
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save
                    </>
                  )}
                </motion.button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Form Column */}
              <motion.div 
                className="xl:col-span-7 bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Section Navigation */}
                <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  {sections.map(section => (
                    <motion.button
                      key={section.id}
                      className={`px-3 sm:px-5 py-4 flex items-center whitespace-nowrap ${
                        activeSection === section.id 
                          ? 'dark:text-white' 
                          : 'dark:text-white'
                      }`}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
                    >
                      <span className="mr-2">{section.icon}</span>
                      <span className="text-sm sm:text-base">{section.name}</span>
                      {savedSections.has(section.id) && (
                        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full" title="Saved"></span>
                      )}
                    </motion.button>
                  ))}
                </div>
                
                {/* Form Content */}
                <div className="p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={sectionAnimation}
                    >
                      {/* UPDATE RESUME FORM WITH NEW PROPS */}
                      <ResumeForm 
                        activeSection={activeSection} 
                        updatePreview={handleUpdatePreview}
                        onSectionSave={handleSectionSave}
                        existingData={sectionData}
                        userId={userId}
                        resumeVersionId={resumeVersionId}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
              
              {/* Preview Column */}
              <motion.div 
                className="xl:col-span-5 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Template Controls */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-0">Template</h3>
                    <div className="flex flex-wrap gap-2">
                      {templates.map(template => (
                        <motion.button
                          key={template}
                          className={`px-3 py-1 text-sm rounded-md ${
                            activeTemplate === template 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveTemplate(template)}
                        >
                          {template.charAt(0).toUpperCase() + template.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm"
                      onClick={handleDisplayPreview}
                    >
                      {showPreview ? (
                        <>
                          <EyeOff size={16} className="mr-2" />
                          Hide Preview
                        </>
                      ) : (
                        <>
                          <Eye size={16} className="mr-2" />
                          Display Preview
                        </>
                      )}
                    </motion.button>
                    
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        title="Download Resume"
                        onClick={handleDownloadClick}
                      >
                        <Download size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 relative"
                        title="Share Resume"
                        onClick={handleShareClick}
                        disabled={isShareLoading}
                      >
                        {isShareLoading ? (
                          <svg
                            className="animate-spin w-5 h-5 text-blue-600 dark:text-blue-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        ) : (
                          <Share2 size={18} />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                {/* Resume Preview - Only shown when showPreview is true */}
                <AnimatePresence>
                  {showPreview && (
                    <motion.div 
                      className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 dark:text-white">Preview</h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={toggleFullscreenPreview}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {fullscreenLoading ? (
                            <LoadingSpinner size="small" />
                          ) : (
                            <Maximize2 size={18} />
                          )}
                        </motion.button>
                      </div>
                      <div className="p-4 h-full overflow-y-auto">
                        <ResumePreview 
                            resumeData={{
                              sections: Object.keys(sectionData).map(key => ({
                                id: key,
                                ...sectionData[key]
                              })),
                              activeTemplate
                            }}
                            template={activeTemplate} 
                          />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Placeholder when preview is not shown */}
                {!showPreview && (
                  <motion.div 
                    className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center p-6">
                      <Eye size={32} className="mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                      <p className="text-gray-500 dark:text-gray-400">Click "Display Preview" to see your resume</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
      
      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isAIAssistantOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-80 lg:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={aiPanelAnimation}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400 mr-3">
                  <Wand2 size={20} />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">AI Assistant</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAIAssistantOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X size={20} />
              </motion.button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Job Description</h4>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Upload a job description to tailor your resume</p>
                  <input
                    type="file"
                    id="file-upload"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <button 
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm flex items-center justify-center mx-auto"
                    onClick={triggerFileInput}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Document
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggestions</h4>
                
                <motion.div 
                  className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg mb-3"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full text-purple-600 dark:text-purple-400 mr-3">
                      <Lightbulb size={16} />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">Add measurable achievements</h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Try quantifying your work experience with metrics and specific results.
                      </p>
                      <button className="text-purple-600 dark:text-purple-400 text-sm font-medium mt-2">
                        Generate suggestions
                      </button>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full text-purple-600 dark:text-purple-400 mr-3">
                      <Lightbulb size={16} />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">Enhance your summary</h5>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Your summary could be more impactful with specific skills relevant to your target role.
                      </p>
                      <button className="text-purple-600 dark:text-purple-400 text-sm font-medium mt-2">
                        Improve summary
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Feedback</h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Your resume is looking good! Consider adding more technical skills and highlighting specific projects you've worked on to stand out to employers.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Share Modal Component */}
      <AnimatePresence>
        {shareModalOpen && (
          <ShareModal 
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            onShare={handleShareLink}
          />
        )}
      </AnimatePresence>
      
      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <div 
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && toggleFullscreenPreview()}
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resume Preview</h2>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDownloadClick}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 rounded-full shadow"
                    title="Download Resume"
                  >
                    <Download size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShareClick}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 rounded-full shadow"
                    title="Share Resume"
                  >
                    {isShareLoading ? (
                      <svg
                        className="animate-spin w-5 h-5 text-blue-600 dark:text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <Share2 size={20} />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleFullscreenPreview}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-gray-800 rounded-full shadow"
                    title="Close Fullscreen"
                  >
                    {fullscreenLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <Minimize2 size={20} />
                    )}
                  </motion.button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 md:p-8">
                  <ResumePreview 
                    data={formData} 
                    template={activeTemplate} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;