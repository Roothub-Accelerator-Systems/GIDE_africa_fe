import { Download, Share2, Linkedin } from "lucide-react";
import Button from "../Shared/Button";

const ResumePreview = ({ resumeData }) => {
  // Find sections by ID
  const getSection = (id) => resumeData?.sections?.find(section => section.id === id) || {};
  
  // Get personal info section
  const personalInfo = getSection("personal");
  const summary = getSection("summary");
  const experience = getSection("experience");
  const education = getSection("education");
  const skills = getSection("skills");
  
  // Function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preview Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">Resume Preview</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Download size={16} className="mr-1" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Share2 size={16} className="mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Linkedin size={16} className="mr-1" />
            LinkedIn
          </Button>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="flex-grow overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-md p-8">
          {/* Header/Personal Info */}
          <div className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {personalInfo.fullName || "Your Name"}
            </h1>
            
            <div className="mt-2 text-gray-600 dark:text-gray-400">
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {personalInfo.location && (
                  <span>{personalInfo.location}</span>
                )}
                {personalInfo.email && (
                  <span>{personalInfo.email}</span>
                )}
                {personalInfo.phone && (
                  <span>{personalInfo.phone}</span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
                {personalInfo.linkedin && (
                  <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    LinkedIn
                  </a>
                )}
                {personalInfo.portfolio && (
                  <a href={personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Summary Section */}
          {summary.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Professional Summary</h2>
              <p className="text-gray-700 dark:text-gray-300">{summary.summary}</p>
            </div>
          )}
          
          {/* Experience Section */}
          {experience.items && experience.items.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Experience</h2>
              <div className="space-y-4">
                {experience.items.map((job, index) => (
                  <div key={index} className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{job.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{job.company}{job.location ? `, ${job.location}` : ''}</p>
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-sm mt-1 sm:mt-0">
                        {formatDate(job.startDate)} - {job.current ? 'Present' : formatDate(job.endDate)}
                      </div>
                    </div>
                    
                    {job.description && (
                      <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">{job.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Education Section */}
          {education.items && education.items.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Education</h2>
              <div className="space-y-4">
                {education.items.map((edu, index) => (
                  <div key={index} className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{edu.degree}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{edu.institution}{edu.location ? `, ${edu.location}` : ''}</p>
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-sm mt-1 sm:mt-0">
                        {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                      </div>
                    </div>
                    
                    {edu.description && (
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Skills Section */}
          {skills.skills && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.skills.split(',').map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;