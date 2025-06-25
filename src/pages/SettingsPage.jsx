import { useState } from "react";
import { 
  Bell, 
  Shield, 
  Monitor, 
  Globe,
  User,
  Check
} from "lucide-react";

import Navbar from "../components/Shared/Navbar";
import Sidebar from "../components/Shared/Sidebar";
import ProfileSettings from "../components/settings/ProfileSettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import LanguageSettings from "../components/settings/LanguageSettings";

const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); 
  const [theme, setTheme] = useState("system");
  const [showNotifications, setShowNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [shareUsageData, setShareUsageData] = useState(true);
  const [language, setLanguage] = useState("english");
  const [savedMessage, setSavedMessage] = useState("");
  const [profileIcon, setProfileIcon] = useState("default");

  // Toggle sidebar (for mobile view)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle theme change
  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    // Here you would implement the actual theme change logic
  };

  // Save settings
  const saveSettings = () => {
    // Here you would typically send this data to your backend
    console.log("Settings saved:", {
      theme,
      showNotifications,
      emailNotifications,
      shareUsageData,
      language,
      profileIcon
    });
    
    // Show success message
    setSavedMessage("Settings saved successfully!");
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  // Setting category components
  const settingCategories = [
    { 
      id: "profile", 
      name: "Profile", 
      icon: <User size={20} /> 
    },
    { 
      id: "appearance", 
      name: "Appearance", 
      icon: <Monitor size={20} /> 
    },
    { 
      id: "notifications", 
      name: "Notifications", 
      icon: <Bell size={20} /> 
    },
    { 
      id: "privacy", 
      name: "Privacy & Data", 
      icon: <Shield size={20} /> 
    },
    { 
      id: "language", 
      name: "Language & Region", 
      icon: <Globe size={20} /> 
    }
  ];

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange }) => {
    return (
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
          enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
        }`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`${
            enabled ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
        />
      </button>
    );
  };

  // Render active setting component
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettings
            profileIcon={profileIcon}
            setProfileIcon={setProfileIcon}
          />
        );
      case "appearance":
        return (
          <AppearanceSettings
            theme={theme}
            handleThemeChange={handleThemeChange}
            ToggleSwitch={ToggleSwitch}
          />
        );
      case "notifications":
        return (
          <NotificationSettings
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            ToggleSwitch={ToggleSwitch}
          />
        );
      case "privacy":
        return (
          <PrivacySettings
            shareUsageData={shareUsageData}
            setShareUsageData={setShareUsageData}
            ToggleSwitch={ToggleSwitch}
          />
        );
      case "language":
        return (
          <LanguageSettings
            language={language}
            setLanguage={setLanguage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Include the Sidebar component */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Include the Navbar component */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Settings Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage your account preferences and application settings
                </p>
              </div>

              {/* Settings Content */}
              <div className="flex flex-col lg:flex-row min-h-[600px]">
                {/* Settings sidebar/categories */}
                <div className="w-full lg:w-72 bg-gray-50 dark:bg-gray-800/50 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                  <nav className="py-6">
                    <ul className="space-y-1 px-4">
                      {settingCategories.map((category) => (
                        <li key={category.id}>
                          <button
                            onClick={() => setActiveTab(category.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                              activeTab === category.id
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm border-l-4 border-blue-500"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            }`}
                          >
                            <span className={`mr-3 ${
                              activeTab === category.id 
                                ? "text-blue-600 dark:text-blue-400" 
                                : "text-gray-500 dark:text-gray-400"
                            }`}>
                              {category.icon}
                            </span>
                            <span>{category.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* Settings form */}
                <div className="flex-1 p-8 lg:p-10">
                  {renderActiveComponent()}

                  {/* Save button - Only show for non-profile tabs since profile is read-only */}
                  {activeTab !== "profile" && (
                    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center">
                        {savedMessage && (
                          <div className="flex items-center text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                            <Check size={16} className="mr-2" />
                            {savedMessage}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={saveSettings}
                        className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;