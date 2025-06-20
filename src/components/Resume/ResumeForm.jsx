import { useState } from "react";
import SectionEditor from "./SectionEditor";
import Button from "../Shared/Button";
import { Upload, Sparkles, FileText } from "lucide-react";

const ResumeForm = ({ updatePreview, activeSection }) => {
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
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        portfolio: "",
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
        summary: "",
        aiSuggestion: true,
      },
      {
        id: "experience",
        title: "Work Experience",
        addable: true,
        removable: true,
        addButtonText: "Experience",
        items: [
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
        items: [
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
        skills: "",
        aiSuggestion: true,
      },
    ],
    activeTemplate: "modern",
  });

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

  // Function to handle job description upload
  const handleJobDescriptionUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // In a real app, this would process the file and extract keywords
    console.log("Job description file uploaded:", file.name);
    
    // For demo purposes, just show a message
    alert("Job description uploaded! In a real app, AI would analyze this to tailor your resume.");
  };

  // Filter for active section only instead of showing all sections
  const activeSectionData = resumeData.sections.find(section => section.id === activeSection);

  return (
    <div className="flex flex-col">
      {/* Job Description Upload - Only show on initial view or when appropriate */}
      {/* {activeSection === "personal" && (
        <div className="mb-6 bg-blue-50 dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 flex items-center">
                <Sparkles size={20} className="mr-2" />
                Tailor Your Resume with AI
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a job description to optimize your resume for specific positions.
              </p>
            </div>
            <div className="flex">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleJobDescriptionUpload}
                />
                <Button variant="outline" className="flex items-center">
                  <Upload size={18} className="mr-2" />
                  Upload Job Description
                </Button>
              </label>
            </div>
          </div>
        </div>
      )} */}

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

      {/* Save/Export Button - Can be conditionally shown as needed */}
      <div className="mt-8 flex justify-center">
        <Button className="flex items-center px-6">
          <FileText size={18} className="mr-2" />
          Save & Preview Resume
        </Button>
      </div>
    </div>
  );
};

export default ResumeForm;