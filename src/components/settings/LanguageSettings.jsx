const LanguageSettings = ({ language, setLanguage }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Language Settings</h2>
      <div className="max-w-xs">
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Display language
        </label>
        <select
          id="language"
          name="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 dark:text-gray-100"
        >
          <option value="english">English</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
          <option value="german">German</option>
          <option value="chinese">Chinese</option>
          <option value="japanese">Japanese</option>
        </select>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Regional Settings</h2>
        <div className="mt-4 max-w-xs">
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Time zone
          </label>
          <select
            id="timezone"
            name="timezone"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-gray-900 dark:text-gray-100"
            defaultValue="UTC"
          >
            <option value="UTC">UTC (Coordinated Universal Time)</option>
            <option value="EST">EST (Eastern Standard Time)</option>
            <option value="CST">CST (Central Standard Time)</option>
            <option value="MST">MST (Mountain Standard Time)</option>
            <option value="PST">PST (Pacific Standard Time)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;