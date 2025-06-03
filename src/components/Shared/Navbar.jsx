import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, User, Settings, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LogoutConfirmation from "./LogoutConfirmation";
import ApiService from "../Auth/ApiService";

const Navbar = ({ toggleSidebar }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Handle clicking outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load user data from backend on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (ApiService.isAuthenticated()) {
          console.log('Fetching user data from backend...');
          const user = await ApiService.getCurrentUser();
          console.log('Received user data:', user);
          
          setUserData({
            fullName: user.full_name || user.name || user.fullName || '',
            email: user.email || '',
            avatar: user.avatar || user.picture || user.profile_picture || null,
            id: user.id || user.sub || user.user_id || null,
          });
        } else {
          console.log('User not authenticated, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        console.error('Error details:', error.message);
        
        // If token is invalid, clear it and redirect to login
        if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
          console.log('Token invalid, clearing and redirecting to login');
          localStorage.removeItem('authToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Navigation handlers
  const navigateToProfile = () => {
    setUserMenuOpen(false);
    navigate("/profile");
  };

  const navigateToSettings = () => {
    setUserMenuOpen(false);
    navigate("/settings");
  };

  // Toggle logout confirmation
  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setShowLogoutConfirmation(true);
  };

  // Handle logout confirmation response
  const handleLogoutConfirmation = async (confirmed) => {
    setShowLogoutConfirmation(false);
    if (confirmed) {
      try {
        await ApiService.logout();
        // Redirect to login page
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Still redirect even if logout fails
        navigate('/login');
      }
    }
  };

  // Get user's initials for avatar fallback
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

  // Show loading state
  if (loading) {
    return (
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="md:absolute left-1 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center ml-3 md:ml-0">
                <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Resume Builder
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo and mobile menu button */}
          <div className="flex items-center">
            {/* Menu button - visible on all screen sizes */}
            <button
              onClick={toggleSidebar}
              className="md:absolute left-1 p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center ml-3 md:ml-0">
              <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Resume Builder
              </span>
            </div>
          </div>

          {/* Right side: Theme toggle and user avatar */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* User Profile */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 overflow-hidden"
                aria-label="User menu"
              >
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getUserInitials()}
                  </span>
                )}
                {/* Fallback for broken images */}
                {userData.avatar && (
                  <span 
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden"
                    style={{ display: 'none' }}
                  >
                    {getUserInitials()}
                  </span>
                )}
              </button>

              {/* User dropdown menu with animation */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {userData?.fullName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userData?.email || "Loading..."}
                    </p>
                    {/* Debug info - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <p className="text-xs text-red-500 mt-1">
                        Debug: {JSON.stringify(userData)}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={navigateToProfile}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <User size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
                    Profile
                  </button>
                  <button 
                    onClick={navigateToSettings}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <Settings size={16} className="mr-3 text-gray-500 dark:text-gray-400" />
                    Settings
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button 
                    onClick={handleLogoutClick}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <LogOut size={16} className="mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <LogoutConfirmation onConfirm={handleLogoutConfirmation} />
      )}
    </nav>
  );
};

export default Navbar;