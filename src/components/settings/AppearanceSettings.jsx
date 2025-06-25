import { Sun, Moon, Monitor } from "lucide-react";

const AppearanceSettings = ({ theme, handleThemeChange, ToggleSwitch }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Theme</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleThemeChange("light")}
          className={`flex items-center justify-center p-4 border-2 rounded-lg ${
            theme === "light"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex flex-col items-center">
            <Sun size={24} className="text-yellow-500 mb-2" />
            <span className="text-gray-800 dark:text-gray-200">Light</span>
          </div>
        </button>
        <button
          onClick={() => handleThemeChange("dark")}
          className={`flex items-center justify-center p-4 border-2 rounded-lg ${
            theme === "dark"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex flex-col items-center">
            <Moon size={24} className="text-indigo-500 mb-2" />
            <span className="text-gray-800 dark:text-gray-200">Dark</span>
          </div>
        </button>
        <button
          onClick={() => handleThemeChange("system")}
          className={`flex items-center justify-center p-4 border-2 rounded-lg ${
            theme === "system"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex flex-col items-center">
            <Monitor size={24} className="text-gray-500 mb-2" />
            <span className="text-gray-800 dark:text-gray-200">System</span>
          </div>
        </button>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Accessibility</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Reduce animations
            </label>
            <ToggleSwitch enabled={false} onChange={() => {}} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              High contrast mode
            </label>
            <ToggleSwitch enabled={false} onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;