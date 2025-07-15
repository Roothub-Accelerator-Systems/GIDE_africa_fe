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
  // Initial resume data structure
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
        id: "experience",
        title: "Work Experience",
        addable: true,
        removable: true,
        addButtonText: "Experience",
        items: existingData.experience?.items || [
          {
            title: "Position Title",
            company: "Company Name",
            location: "City, State",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
          }
        ],
        itemFields: [
          { name: "title", label: "Position Title", required: true, placeholder: "Software Engineer" },
          { name: "company", label: "Company Name", required: true, placeholder: "Acme Inc." },
          { name: "location", label: "Location", placeholder: "San Francisco, CA" },
          { name: "startDate", label: "Start Date", type: "month", required: true },
          { name: "endDate", label: "End Date", type: "month" },
          { name: "current", label: "I currently work here", type: "checkbox" },
          { 
            name: "description", 
            label: "Description", 
            type: "textarea", 
            rows: 5, 
            required: true,
            placeholder: "Describe your responsibilities and achievements in this role."
          },
        ],
        aiSuggestion: true,
      },
      {
        id: "education",
        title: "Education",
        addable: true,
        removable: true,
        addButtonText: "Education",
        items: existingData.education?.items || [
          {
            degree: "Degree Name",
            institution: "Institution Name",
            location: "City, State",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
          }
        ],
        itemFields: [
          { name: "degree", label: "Degree/Certificate", required: true, placeholder: "Bachelor of Science in Computer Science" },
          { name: "institution", label: "Institution", required: true, placeholder: "University Name" },
          { name: "location", label: "Location", placeholder: "City, State" },
          { name: "startDate", label: "Start Date", type: "month" },
          { name: "endDate", label: "End Date", type: "month" },
          { name: "current", label: "I'm currently studying here", type: "checkbox" },
          { 
            name: "description", 
            label: "Additional Information", 
            type: "textarea", 
            placeholder: "Relevant coursework, achievements, GPA, etc."
          },
        ],
      },
      {
        id: "skills",
        title: "Skills",
        fields: [
          { 
            name: "skills", 
            label: "Skills", 
            type: "textarea", 
            placeholder: "List your skills, separated by commas",
            helpText: "Example: JavaScript, React, Python, Project Management, Leadership"
          },
        ],
        ...existingData.skills,
        aiSuggestion: true,
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

  // **FIXED**: Enhanced save function with better error handling
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

      // Extract just the data fields (not the field definitions)
      const sectionDataToSave = {};
      
      if (activeSectionData.fields) {
        // For simple field sections
        activeSectionData.fields.forEach(field => {
          sectionDataToSave[field.name] = activeSectionData[field.name] || "";
        });
      }
      
      if (activeSectionData.items) {
        // For array-based sections
        sectionDataToSave.items = activeSectionData.items;
      }
      
      // Transform data based on section type
      let transformedData = sectionDataToSave;
      
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
      } else {
        transformedData = {
          ...transformedData,
          resume_version_id: resumeVersionId,
          user_id: userId
        };
      }
      
      // **DEBUGGING**: Log the data being sent
      console.log('=== SAVING SECTION DATA ===');
      console.log('Active Section:', activeSection);
      console.log('Resume Version ID:', resumeVersionId);
      console.log('User ID:', userId);
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

  // Handler for adding an item to a section array (e.g., new work experience)
  const handleAddItem = (sectionId) => {
    const section = resumeData.sections.find(s => s.id === sectionId);
    if (!section || !section.items) return;

    // Create a new empty item based on the first item structure
    const newItem = {};
    section.itemFields.forEach(field => {
      newItem[field.name] = "";
    });

    // Add default title for display
    if (sectionId === "experience") {
      newItem.title = "Position Title";
      newItem.company = "Company Name";
    } else if (sectionId === "education") {
      newItem.degree = "Degree Name";
      newItem.institution = "Institution Name";
    }

    const updatedItems = [...section.items, newItem];
    updateSection(sectionId, { items: updatedItems });
  };

  // Handler for removing an item from a section array
  const handleRemoveItem = (sectionId, itemIndex) => {
    const section = resumeData.sections.find(s => s.id === sectionId);
    if (!section || !section.items) return;

    const updatedItems = section.items.filter((_, index) => index !== itemIndex);
    updateSection(sectionId, { items: updatedItems });
  };

  const activeSectionData = resumeData.sections.find(section => section.id === activeSection);

  // **FIXED**: Don't render if we don't have the required data
  if (!resumeVersionId || !userId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading resume data...</p>
          <p className="text-sm text-gray-500 mt-2">
            {/* Resume Version ID: {resumeVersionId || 'Not set'} */}
          </p>
          <p className="text-sm text-gray-500">
            {/* User ID: {userId || 'Not set'} */}
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
            addable={activeSectionData.addable}
            removable={activeSectionData.removable}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
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