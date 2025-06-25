import { Database, X } from "lucide-react";

const PrivacySettings = ({ shareUsageData, setShareUsageData, ToggleSwitch }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Privacy & Data Usage</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share usage data
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Help improve the application by sharing anonymous usage data
            </p>
          </div>
          <ToggleSwitch 
            enabled={shareUsageData} 
            onChange={setShareUsageData} 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Data Management</h2>
        <div className="mt-4 space-y-4">
          <button
            type="button"
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Database size={16} className="mr-2 text-gray-500" />
            Download my data
          </button>
          <button
            type="button"
            className="flex items-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X size={16} className="mr-2" />
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;