import { useState, useEffect } from "react";
import SectionEditor from "./SectionEditor";
import Button from "../Shared/Button";
import { Upload, Sparkles, FileText } from "lucide-react";
import ApiService from "../Auth/ApiService";

const ResumeForm = ({ 
  updatePreview, 
  activeSection, 
  onSectionSave, 
  existingData = {}, 
  resumeVersionId = null,
  userId = null
}) => {
  // **UPDATED**: Initial resume data structure to match API schema
  const [resumeData, setResumeData] = useState({
    sections: [
      {
        id: "personal",
        title: "Personal Information",
        fields: [
          { name: "fullName", label: "Full Name", required: true, placeholder: "John Doe" },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "john@example.com" },
          { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "(123) 456-7890" },
          { name: "location", label: "Location", placeholder: "City, State/Country" },
          { name: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/johndoe" },
          { name: "portfolio", label: "Portfolio/Website", placeholder: "johndoe.com" },
        ],
        ...existingData.personal,
      },
      {
        id: "summary",
        title: "Professional Summary",
        fields: [
          { 
            name: "summary", 
            label: "Summary", 
            type: "textarea", 
            rows: 4, 
            required: true, 
            placeholder: "Briefly describe your professional background and key qualifications.",
            helpText: "Aim for 3-5 sentences that highlight your experience and strengths."
          },
        ],
        ...existingData.summary,
        aiSuggestion: true,
      },
      {
        id: "skills",
        title: "Skills",
        fields: [
          { name: "jobTitle", label: "Job Title", required: true, placeholder: "Software Engineer" },
          { name: "companyName", label: "Company Name", required: true, placeholder: "Tech Corp" },
          { name: "location", label: "Location", placeholder: "San Francisco, CA" },
          { name: "startDate", label: "Start Date", type: "datetime-local", required: true },
          { name: "endDate", label: "End Date", type: "datetime-local", required: true },
          { name: "description", label: "Description", type: "textarea", rows: 3, placeholder: "Describe your role and responsibilities" },
          { name: "skill", label: "Skill", required: true, placeholder: "JavaScript, React, Python, etc." },
        ],
        ...existingData.skills,
        aiSuggestion: true,
      },
      {
        id: "experience",
        title: "Work Experience",
        fields: [
          { name: "jobTitle", label: "Job Title", required: true, placeholder: "Software Engineer" },
          { name: "companyName", label: "Company Name", required: true, placeholder: "Tech Corp" },
          { name: "location", label: "Location", placeholder: "San Francisco, CA" },
          { name: "startDate", label: "Start Date", type: "datetime-local", required: true },
          { name: "endDate", label: "End Date", type: "datetime-local", required: true },
          { name: "description", label: "Description", type: "textarea", rows: 5, required: true, placeholder: "Describe your responsibilities and achievements" },
          { name: "skill", label: "Skills Used", placeholder: "Technologies and skills used in this role" },
        ],
        ...existingData.experience,
        aiSuggestion: true,
      },
      {
        id: "education",
        title: "Education",
        fields: [
          { name: "degree", label: "Degree/Certificate", required: true, placeholder: "Bachelor of Science in Computer Science" },
          { name: "institutionName", label: "Institution Name", required: true, placeholder: "University Name" },
          { name: "location", label: "Location", placeholder: "City, State" },
          { name: "startDate", label: "Start Date", type: "datetime-local", required: true },
          { name: "endDate", label: "End Date", type: "datetime-local", required: true },
          { name: "additionalInfo", label: "Additional Information", type: "textarea", placeholder: "Relevant coursework, achievements, GPA, etc." },
        ],
        ...existingData.education,
      },
    ],
    activeTemplate: "modern",
  });

  // **FIXED**: Update resume data when existing data changes
  useEffect(() => {
    if (existingData && Object.keys(existingData).length > 0) {
      setResumeData(prevData => ({
        ...prevData,
        sections: prevData.sections.map(section => ({
          ...section,
          ...existingData[section.id]
        }))
      }));
    }
  }, [existingData]);

  // **FIXED**: Enhanced save function with proper data transformation
  const handleSaveAndPreview = async () => {
    // **CRITICAL**: Check if we have the required IDs
    if (!resumeVersionId) {
      console.error('Resume version ID is missing');
      alert('Resume version ID is missing. Please refresh the page and try again.');
      return;
    }

    if (!userId) {
      console.error('User ID is missing');
      alert('User ID is missing. Please refresh the page and try again.');
      return;
    }

    const activeSectionData = resumeData.sections.find(section => section.id === activeSection);
    
    if (activeSectionData && onSectionSave) {
      // Check if we have a valid token before making the request
      const token = ApiService.getAccessToken();
      if (!token || ApiService.isTokenExpired(token)) {
        console.error('No valid authentication token found');
        alert('Your session has expired. Please log in again.');
        return;
      }

      // Extract data fields based on section type
      const sectionDataToSave = {};
      
      if (activeSectionData.fields) {
        // For field-based sections, extract field values
        activeSectionData.fields.forEach(field => {
          sectionDataToSave[field.name] = activeSectionData[field.name] || "";
        });
      }
      
      // Transform data based on section type to match API schema
      let transformedData = {};
      
      if (activeSection === 'personal') {
        transformedData = {
          resume_version_id: resumeVersionId,
          user_id: userId,
          full_name: sectionDataToSave.fullName || "",
          email: sectionDataToSave.email || "",
          phone_number: sectionDataToSave.phone || "",
          location: sectionDataToSave.location || "",
          linkedin_url: sectionDataToSave.linkedin || "",
          portfolio_url: sectionDataToSave.portfolio || ""
        };
      } else if (activeSection === 'skills') {
        // Skills now uses the same format as work experience
        transformedData = {
          jobTitle: sectionDataToSave.jobTitle || "",
          companyName: sectionDataToSave.companyName || "",
          location: sectionDataToSave.location || "",
          startDate: sectionDataToSave.startDate || "",
          endDate: sectionDataToSave.endDate || "",
          description: sectionDataToSave.description || "",
          skill: sectionDataToSave.skill || ""
        };
      } else if (activeSection === 'experience') {
        // Work experience format
        transformedData = {
          jobTitle: sectionDataToSave.jobTitle || "",
          companyName: sectionDataToSave.companyName || "",
          location: sectionDataToSave.location || "",
          startDate: sectionDataToSave.startDate || "",
          endDate: sectionDataToSave.endDate || "",
          description: sectionDataToSave.description || "",
          skill: sectionDataToSave.skill || ""
        };
      } else if (activeSection === 'education') {
        // Education format
        transformedData = {
          degree: sectionDataToSave.degree || "",
          institutionName: sectionDataToSave.institutionName || "",
          location: sectionDataToSave.location || "",
          startDate: sectionDataToSave.startDate || "",
          endDate: sectionDataToSave.endDate || "",
          additionalInfo: sectionDataToSave.additionalInfo || ""
        };
      } else if (activeSection === 'summary') {
        // Summary section (no JSON body required)
        transformedData = {
          summary: sectionDataToSave.summary || ""
        };
      }
      
      // **DEBUGGING**: Log the data being sent
      console.log('=== SAVING SECTION DATA ===');
      console.log('Active Section:', activeSection);
      console.log('Resume Version ID:', resumeVersionId);
      console.log('User ID:', userId);
      console.log('Section Data:', sectionDataToSave);
      console.log('Transformed Data:', transformedData);
      console.log('============================');
      
      try {
        await onSectionSave(activeSection, transformedData);
      } catch (error) {
        console.error('Error saving section:', error);
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          alert('Your session has expired. Please log in again.');
        } else {
          alert('Failed to save section. Please try again.');
        }
      }
    }
  };

  // Function to handle section data updates
  const updateSection = (sectionId, updatedSectionData) => {
    const updatedSections = resumeData.sections.map(section => 
      section.id === sectionId ? { ...section, ...updatedSectionData } : section
    );
    
    const newResumeData = {
      ...resumeData,
      sections: updatedSections
    };
    
    setResumeData(newResumeData);
    if (updatePreview) {
      updatePreview(newResumeData);
    }
  };

  // Handler for updating a specific section
  const handleSectionUpdate = (updatedSection) => {
    updateSection(updatedSection.id, updatedSection);
  };

  // **REMOVED**: Add/Remove item handlers since we're using single forms now
  // Skills, Experience, and Education are now single form sections like Personal

  const activeSectionData = resumeData.sections.find(section => section.id === activeSection);

  // **FIXED**: Don't render if we don't have the required data
  if (!resumeVersionId || !userId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading resume data...</p>
          <p className="text-sm text-gray-500 mt-2">
            Click the create button to start building your resume.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Show only the active section */}
      {activeSectionData && (
        <div className="space-y-6">
          <SectionEditor
            key={activeSectionData.id}
            section={activeSectionData}
            updateSection={handleSectionUpdate}
            addable={false} // Changed to false since we're using single forms
            removable={false} // Changed to false since we're using single forms
            onAdd={null}
            onRemove={null}
            aiSuggestion={activeSectionData.aiSuggestion}
          />
        </div>
      )}

      {/* Save/Export Button */}
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleSaveAndPreview} 
          className="flex items-center px-6"
          disabled={!resumeVersionId || !userId}
        >
          <FileText size={18} className="mr-2" />
          Save & Preview Resume
        </Button>
      </div>
    </div>
  );
};

export default ResumeForm;