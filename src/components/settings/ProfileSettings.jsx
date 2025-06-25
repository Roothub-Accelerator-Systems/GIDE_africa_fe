import { useState, useEffect } from "react";
import { User, Mail, Calendar, Shield } from "lucide-react";
import ApiService from "../Auth/ApiService";
import { useAuthStore } from "../Auth/useAuthStore";

const ProfileSettings = () => {
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    username: '',
    bio: '',
    createdAt: '',
    lastLogin: ''
  });
  const [loading, setLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState('');

  const { firebase_user } = useAuthStore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const hasFirebaseUser = !!firebase_user;
        const hasBackendAuth = ApiService.isAuthenticated();
        const hasValidToken = hasBackendAuth && !ApiService.isTokenExpired(ApiService.getAccessToken());
        
        // Get auth method tracking
        const lastAuthMethod = localStorage.getItem('lastAuthMethod');
        const authTimestamp = localStorage.getItem('authTimestamp');
        const currentTime = Date.now();
        const isRecentAuth = authTimestamp && (currentTime - parseInt(authTimestamp)) < 5000;
        
        let activeAuthMethod = null;
        
        // Check for recent auth first
        if (isRecentAuth && lastAuthMethod) {
          if (lastAuthMethod === 'google' && hasFirebaseUser) {
            activeAuthMethod = 'google';
          } else if (lastAuthMethod === 'jwt' && hasValidToken) {
            activeAuthMethod = 'jwt';
          }
        }
        
        // Fallback to current state analysis
        if (!activeAuthMethod) {
          if (hasFirebaseUser && hasValidToken) {
            activeAuthMethod = 'jwt';
          } else if (hasFirebaseUser && !hasValidToken) {
            activeAuthMethod = 'google';
          } else if (!hasFirebaseUser && hasValidToken) {
            activeAuthMethod = 'jwt';
          }
        }
        
        setAuthMethod(activeAuthMethod);
        
        // Apply authentication method
        switch (activeAuthMethod) {
          case 'google':
            if (hasFirebaseUser && firebase_user) {
              setUserData({
                fullName: firebase_user.displayName || firebase_user.email?.split('@')[0] || '',
                email: firebase_user.email || '',
                username: firebase_user.email?.split('@')[0] || '',
                bio: 'Google Account User',
                createdAt: firebase_user.metadata?.creationTime || '',
                lastLogin: firebase_user.metadata?.lastSignInTime || ''
              });
            }
            break;
            
          case 'jwt':
            if (hasValidToken) {
              try {
                const user = await ApiService.getCurrentUser();
                
                setUserData({
                  fullName: user.username || user.full_name || user.name || user.fullName || user.displayName || user.email?.split('@')[0] || '',
                  email: user.email || '',
                  username: user.username || user.email?.split('@')[0] || '',
                  bio: user.bio || 'Backend Account User',
                  createdAt: user.created_at || user.createdAt || '',
                  lastLogin: user.last_login || user.lastLogin || ''
                });
              } catch  {
                // Fallback to JWT token decoding
                const token = ApiService.getAccessToken();
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  
                  setUserData({
                    fullName: payload.username || payload.full_name || payload.name || payload.email?.split('@')[0] || '',
                    email: payload.email || payload.sub || '',
                    username: payload.username || payload.email?.split('@')[0] || '',
                    bio: 'JWT Account User',
                    createdAt: new Date(payload.iat * 1000).toISOString() || '',
                    lastLogin: new Date().toISOString()
                  });
                } catch (tokenError) {
                  console.error('Failed to decode JWT token:', tokenError);
                  setUserData({
                    fullName: '',
                    email: '',
                    username: '',
                    bio: '',
                    createdAt: '',
                    lastLogin: ''
                  });
                }
              }
            }
            break;
            
          default:
            setUserData({
              fullName: '',
              email: '',
              username: '',
              bio: '',
              createdAt: '',
              lastLogin: ''
            });
            break;
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({
          fullName: '',
          email: '',
          username: '',
          bio: '',
          createdAt: '',
          lastLogin: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [firebase_user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getUserInitials = () => {
    if (userData.fullName) {
      return userData.fullName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return userData.email ? userData.email.charAt(0).toUpperCase() : 'U';
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="flex flex-col items-center md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 space-y-4 max-w-2xl">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Profile Information
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your account details and preferences
        </p>
      </div>
      
      {/* Profile Section */}
      <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Profile Avatar & Color Selection */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getUserInitials()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          
          <div className="text-center">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              {userData.fullName || 'No name provided'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {authMethod === 'google' ? 'Google Account' : 'Standard Account'}
            </p>
          </div>
        </div>
        
        {/* Profile Details */}
        <div className="flex-1 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <User size={18} className="text-gray-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200 flex-1">
                    {userData.fullName || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Email */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Mail size={18} className="text-gray-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200 flex-1">
                    {userData.email || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <span className="text-gray-400 mr-2">@</span>
                  <span className="text-gray-800 dark:text-gray-200 flex-1">
                    {userData.username || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Type
              </label>
              <div className="relative">
                <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Shield size={18} className="text-gray-400 mr-3" />
                  <span className="text-gray-800 dark:text-gray-200 flex-1 capitalize">
                    {authMethod === 'google' ? 'Google Account' : 'Standard Account'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Details Section */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Account Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Created
            </label>
            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <Calendar size={18} className="text-gray-400 mr-3" />
              <span className="text-gray-800 dark:text-gray-200 text-sm">
                {formatDate(userData.createdAt)}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Login
            </label>
            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <Calendar size={18} className="text-gray-400 mr-3" />
              <span className="text-gray-800 dark:text-gray-200 text-sm">
                {formatDate(userData.lastLogin)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Shield size={16} className="mr-2" />
            Change Password
          </button>
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <User size={16} className="mr-2" />
            Edit Profile
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-800/20 border border-red-400 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Note:</strong> Profile information is automatically synced from our database. 
            Fields displayed here are not editable!.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;