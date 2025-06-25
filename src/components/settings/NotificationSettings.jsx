const NotificationSettings = ({ 
  showNotifications, 
  setShowNotifications, 
  emailNotifications, 
  setEmailNotifications, 
  ToggleSwitch 
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Notification Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              In-app notifications
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Receive notifications within the application
            </p>
          </div>
          <ToggleSwitch 
            enabled={showNotifications} 
            onChange={setShowNotifications} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email notifications
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Receive notifications via email
            </p>
          </div>
          <ToggleSwitch 
            enabled={emailNotifications} 
            onChange={setEmailNotifications} 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Notify me about</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center">
            <input
              id="updates"
              name="updates"
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="updates" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Product updates and announcements
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="tips"
              name="tips"
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="tips" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Tips and best practices
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="security"
              name="security"
              type="checkbox"
              defaultChecked={true}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="security" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              Security alerts
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;