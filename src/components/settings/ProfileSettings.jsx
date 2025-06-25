import { User, UserCircle, UserCog } from "lucide-react";

const ProfileSettings = ({ 
  userName, 
  setUserName, 
  userEmail, 
  setUserEmail, 
  profileIcon, 
  setProfileIcon 
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Profile Information</h2>
      
      {/* Profile Icon Selection */}
      <div className="flex flex-col items-center md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            {profileIcon === "default" && <User size={80} className="text-gray-600 dark:text-gray-300" />}
            {profileIcon === "circle" && <UserCircle size={80} className="text-gray-600 dark:text-gray-300" />}
            {profileIcon === "cog" && <UserCog size={80} className="text-gray-600 dark:text-gray-300" />}
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Choose an icon
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setProfileIcon("default")}
              className={`p-2 rounded-full ${profileIcon === "default" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"}`}
            >
              <User size={24} className={`${profileIcon === "default" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`} />
            </button>
            <button
              onClick={() => setProfileIcon("circle")}
              className={`p-2 rounded-full ${profileIcon === "circle" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"}`}
            >
              <UserCircle size={24} className={`${profileIcon === "circle" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`} />
            </button>
            <button
              onClick={() => setProfileIcon("cog")}
              className={`p-2 rounded-full ${profileIcon === "cog" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"}`}
            >
              <UserCog size={24} className={`${profileIcon === "cog" ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 w-full max-w-md">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Account Information</h2>
        <div className="mt-4 space-y-4 max-w-md">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                @
              </span>
              <input
                type="text"
                id="username"
                defaultValue="johndoe"
                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                rows={3}
                defaultValue="I'm a software developer passionate about creating intuitive and accessible user interfaces."
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-gray-900 dark:text-gray-100"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Brief description for your profile.
            </p>
          </div>
          
          <div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;