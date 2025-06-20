import { useState } from 'react';
// import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Shared/Navbar';
import Sidebar from '../components/Shared/Sidebar';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import ApiService from '../components/Auth/ApiService';
import { UploadButton } from '../lib/uploadthing';

const CoverLetter = () => {
  // const {  } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    companyName: '',
    keyPoints: '',
    jobDescriptionUrl: '', // Store UploadThing URL
  });
  
  const [errors, setErrors] = useState({
    fullName: '',
    jobTitle: '',
    companyName: '',
    keyPoints: '',
    fileUpload: '',
  });
  
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLetter, setEditedLetter] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFileType = (file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      if (!hasValidExtension) {
        return { valid: false, error: 'Please upload only PDF, DOC, DOCX, or TXT files.' };
      }
    }
    
    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 2MB.' };
    }
    
    return { valid: true };
  };
  
  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsGenerating(true);
    setGeneratedLetter('');
    
    try {
      const response = await ApiService.generateCoverLetter(formData);
      console.log('Full response.data:', response.data);
      setGeneratedLetter(response.data?.generated_letter || response.data?.letter || response.generated_letter || response.letter || '');
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to generate cover letter. Please try again.'
      }));
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSave = async () => {
    if (!generatedLetter.trim()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const dataToSave = {
        ...formData,
        generatedLetter: isEditing ? editedLetter : generatedLetter,
      };
      
      const response = await ApiService.saveCoverLetter(dataToSave);
      console.log('Cover letter saved:', response);
      
      // Show success message or handle success
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
    } catch (error) {
      console.error('Failed to save cover letter:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to save cover letter. Please try again.'
      }));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCopy = () => {
    const textToCopy = isEditing ? editedLetter : generatedLetter;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 1500);
        console.log('Cover letter copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const handleRegenerate = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsGenerating(true);
    setGeneratedLetter('');
    setIsEditing(false);
    setEditedLetter('');
    
    try {
      const response = await ApiService.generateCoverLetter(formData);
      setGeneratedLetter(response.data?.generated_letter || response.data?.letter || response.generated_letter || response.letter || '');
    } catch (error) {
      console.error('Failed to regenerate cover letter:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to regenerate cover letter. Please try again.'
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedLetter(generatedLetter);
  };

  const handleSaveEdit = () => {
    setGeneratedLetter(editedLetter);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLetter('');
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setFormData(prev => ({
      ...prev,
      jobDescriptionUrl: ''
    }));
    setErrors(prev => ({
      ...prev,
      fileUpload: ''
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">AI Cover Letter Generator</h1>
            
            {/* Error Messages */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md">
                {errors.general}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Job Details</h2>
                
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-md 
                                focus:ring-blue-500 focus:border-blue-500 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                ${errors.fullName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Frontend Developer"
                      className={`w-full px-4 py-2 border rounded-md 
                                focus:ring-blue-500 focus:border-blue-500 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                ${errors.jobTitle ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.jobTitle && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.jobTitle}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. Acme Inc."
                      className={`w-full px-4 py-2 border rounded-md 
                                focus:ring-blue-500 focus:border-blue-500 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                                ${errors.companyName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="keyPoints" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Key Qualifications & Achievements
                    </label>
                    <textarea
                      id="keyPoints"
                      name="keyPoints"
                      value={formData.keyPoints}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="List your relevant skills, experiences, and achievements..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                focus:ring-blue-500 focus:border-blue-500 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  {/* File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Job Description Upload (Optional)
                    </label>
                    
                    {!uploadedFile ? (
                      <div className="mt-1">
                        <UploadButton
                          endpoint="jobDescriptionUploader"
                          onClientUploadComplete={(res) => {
                            console.log("Files: ", res);
                            if (res && res[0]) {
                              setUploadedFile({
                                name: res[0].name,
                                url: res[0].url,
                                size: res[0].size
                              });
                              setFormData(prev => ({
                                ...prev,
                                jobDescriptionUrl: res[0].url
                              }));
                              setErrors(prev => ({
                                ...prev,
                                fileUpload: ''
                              }));
                              setIsUploading(false);
                            }
                          }}
                          onUploadError={(error) => {
                            console.error("Upload error:", error);
                            setIsUploading(false);
                            setErrors(prev => ({
                              ...prev,
                              fileUpload: error.message || 'Upload failed. Please try again.'
                            }));
                          }}
                          onUploadBegin={(name) => {
                            console.log("Upload started for:", name);
                            setIsUploading(true);
                            setErrors(prev => ({
                              ...prev,
                              fileUpload: ''
                            }));
                          }}
                          onUploadProgress={(progress) => {
                            console.log("Upload progress:", progress);
                          }}
                          onBeforeUploadBegin={(files) => {
                            console.log("Files before upload:", files);
                            
                            // Validate each file
                            for (const file of files) {
                              const validation = validateFileType(file);
                              if (!validation.valid) {
                                setErrors(prev => ({
                                  ...prev,
                                  fileUpload: validation.error
                                }));
                                // Return empty array to prevent upload
                                return [];
                              }
                            }
                            
                            return files; // Return files if validation passes
                          }}
                          appearance={{
                            button: `w-full h-32 border-2 border-gray-300 border-dashed rounded-lg 
                                  cursor-pointer bg-gray-50 dark:hover:bg-gray-700 
                                  dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600
                                  flex flex-col items-center justify-center transition-colors
                                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`,
                            allowedContent: "text-xs text-gray-500 dark:text-gray-400",
                          }}
                          content={{
                            button: ({ ready, isUploading: uploading }) => {
                              if (uploading || isUploading) {
                                return (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
                                  </div>
                                );
                              }
                              
                              if (ready) {
                                return (
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC, DOCX, or TXT (MAX. 2MB)</p>
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Getting ready...</p>
                                </div>
                              );
                            },
                            allowedContent: "PDF, DOC, DOCX, or TXT files up to 2MB"
                          }}
                          config={{
                            mode: "auto",
                          }}
                        />
                        {isUploading && (
                          <div className="mt-2 flex items-center justify-center">
                            <LoadingSpinner size="small" color="primary" />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-400">
                                {uploadedFile.name}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-500">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleFileRemove}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {errors.fileUpload && (
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md text-sm">
                        {errors.fileUpload}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isGenerating || isUploading}
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Generated Cover Letter */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Generated Cover Letter</h2>
                  
                  <div className="flex space-x-2">
                    {generatedLetter && !isGenerating && (
                      <>
                        {!isEditing ? (
                          <>
                            <button
                              onClick={handleEdit}
                              disabled={isGenerating}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded
                                      focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={handleRegenerate}
                              disabled={isGenerating}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded
                                      focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60"
                            >
                              Regenerate
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={isSaving}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded
                                      focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCopy}
                              disabled={isGenerating}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded
                                      focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-60 flex items-center"
                            >
                              {copySuccess ? (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Copied!
                                </span>
                              ) : (
                                "Copy"
                              )}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded
                                      focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded
                                      focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {!isEditing ? (
                  <div className="whitespace-pre-line bg-gray-50 dark:bg-gray-700 p-6 rounded-md h-166 overflow-y-auto
                                text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                    {isGenerating ? (
                      <div className="flex items-center justify-center h-full">
                        <LoadingSpinner size="medium" color="primary" />
                      </div>
                    ) : generatedLetter ? (
                      generatedLetter
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        Fill in the form and click "Generate Cover Letter" to create your personalized cover letter
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={editedLetter}
                    onChange={(e) => setEditedLetter(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-md
                             focus:ring-blue-500 focus:border-blue-500 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             font-mono text-sm resize-none"
                    placeholder="Edit your cover letter here..."
                  />
                )}
                
                {generatedLetter && !isGenerating && !isEditing && (
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <p>You can edit this cover letter directly, save it to your account, or click "Regenerate" for a new version.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;