import { Download, Share2, Linkedin, Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";
import { useState } from "react";

const ResumePreview = ({ resumeData }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Helper function to get section data
  const getSection = (id) => {
    if (!resumeData?.sections) return {};
    return resumeData.sections.find(section => section.id === id) || {};
  };
  
  // Get all sections
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

  // Function to handle PDF download
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Method 1: Using browser's print functionality
      const printWindow = window.open('', '_blank');
      const resumeContent = document.getElementById('resume-content');
      
      if (printWindow && resumeContent) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Resume - ${personalInfo.fullName || 'Resume'}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
                .resume-container { max-width: 800px; margin: 0 auto; background: white; }
                .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
                .name { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
                .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; color: #6b7280; }
                .contact-item { display: flex; align-items: center; gap: 5px; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb; }
                .experience-item, .education-item { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f3f4f6; }
                .experience-item:last-child, .education-item:last-child { border-bottom: none; }
                .job-header, .edu-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; }
                .job-title, .degree { font-weight: bold; color: #1f2937; }
                .company, .institution { color: #6b7280; }
                .date { color: #9ca3af; font-size: 14px; }
                .description { color: #4b5563; line-height: 1.6; white-space: pre-line; }
                .skills-container { display: flex; flex-wrap: wrap; gap: 8px; }
                .skill-tag { background: #f3f4f6; color: #374151; padding: 6px 12px; border-radius: 20px; font-size: 14px; }
                @media print { body { background: white; } }
              </style>
            </head>
            <body>
              ${resumeContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      
      // Alternative method using jsPDF (you would need to install jsPDF)
      // const { jsPDF } = window.jspdf;
      // const pdf = new jsPDF();
      // pdf.html(resumeContent, {
      //   callback: function (pdf) {
      //     pdf.save(`${personalInfo.fullName || 'Resume'}.pdf`);
      //   }
      // });
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Preview Controls */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-semibold text-gray-800 text-lg">Resume Preview</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200"
          >
            <Download size={16} className="mr-2" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
            <Share2 size={16} className="mr-2" />
            Share
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200">
            <Linkedin size={16} className="mr-2" />
            LinkedIn
          </button>
        </div>
      </div>
      
      {/* Resume Content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div id="resume-content" className="resume-container max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8 sm:p-10 md:p-12">
            {/* Header/Personal Info */}
            <div className="header text-center mb-8 pb-6 border-b-2 border-gray-200">
              <h1 className="name text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {personalInfo.fullName || "Your Name"}
              </h1>
              
              <div className="contact-info flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-600">
                {personalInfo.email && (
                  <div className="contact-item flex items-center gap-2">
                    <Mail size={16} />
                    <span className="text-sm sm:text-base">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="contact-item flex items-center gap-2">
                    <Phone size={16} />
                    <span className="text-sm sm:text-base">{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="contact-item flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="text-sm sm:text-base">{personalInfo.location}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-3">
                {personalInfo.linkedin && (
                  <a 
                    href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="contact-item flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin size={16} />
                    <span className="text-sm sm:text-base">LinkedIn</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {personalInfo.portfolio && (
                  <a 
                    href={personalInfo.portfolio.startsWith('http') ? personalInfo.portfolio : `https://${personalInfo.portfolio}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="contact-item flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Globe size={16} />
                    <span className="text-sm sm:text-base">Portfolio</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
            
            {/* Professional Summary */}
            {summary.summary && (
              <div className="section mb-8">
                <h2 className="section-title text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Professional Summary
                </h2>
                <p className="description text-gray-700 leading-relaxed text-justify">
                  {summary.summary}
                </p>
              </div>
            )}
            
            {/* Experience Section */}
            {experience.items && experience.items.length > 0 && (
              <div className="section mb-8">
                <h2 className="section-title text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Professional Experience
                </h2>
                <div className="space-y-6">
                  {experience.items.map((job, index) => (
                    <div key={index} className="experience-item pb-6 border-b border-gray-100 last:border-b-0">
                      <div className="job-header flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                        <div className="flex-1">
                          <h3 className="job-title text-lg font-semibold text-gray-900">{job.title}</h3>
                          <div className="company text-gray-600 mt-1">
                            {job.company}
                            {job.location && <span className="ml-2">• {job.location}</span>}
                          </div>
                        </div>
                        <div className="date text-gray-500 text-sm mt-2 sm:mt-0 sm:ml-4">
                          {formatDate(job.startDate)} - {job.current ? 'Present' : formatDate(job.endDate)}
                        </div>
                      </div>
                      
                      {job.description && (
                        <p className="description text-gray-700 leading-relaxed whitespace-pre-line">
                          {job.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Education Section */}
            {education.items && education.items.length > 0 && (
              <div className="section mb-8">
                <h2 className="section-title text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Education
                </h2>
                <div className="space-y-6">
                  {education.items.map((edu, index) => (
                    <div key={index} className="education-item pb-6 border-b border-gray-100 last:border-b-0">
                      <div className="edu-header flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                        <div className="flex-1">
                          <h3 className="degree text-lg font-semibold text-gray-900">{edu.degree}</h3>
                          <div className="institution text-gray-600 mt-1">
                            {edu.institution}
                            {edu.location && <span className="ml-2">• {edu.location}</span>}
                          </div>
                        </div>
                        <div className="date text-gray-500 text-sm mt-2 sm:mt-0 sm:ml-4">
                          {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                        </div>
                      </div>
                      
                      {edu.description && (
                        <p className="description text-gray-700 leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Skills Section */}
            {skills.skills && (
              <div className="section">
                <h2 className="section-title text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Skills
                </h2>
                <div className="skills-container flex flex-wrap gap-2">
                  {skills.skills.split(',').map((skill, index) => (
                    <span 
                      key={index} 
                      className="skill-tag bg-gray-100 text-gray-800 px-3 py-2 rounded-full text-sm font-medium"
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
    </div>
  );
};

export default ResumePreview;