import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, User, Settings, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LogoutConfirmation from "./LogoutConfirmation";
import ApiService from "../Auth/ApiService";
import { useAuthStore } from "../Auth/useAuthStore";

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

  // Get Firebase user and auth functions from auth store
  const { firebase_user, clearUser, completeLogout } = useAuthStore();

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

  // FIXED: Better authentication method detection with proper priority
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get the last used authentication method
        const lastAuthMethod = localStorage.getItem('lastAuthMethod');
        console.log('Last auth method:', lastAuthMethod);
        
        // Priority 1: Check for explicit JWT authentication first
        // This prevents Firebase from overriding JWT logins
        const authStatus = await ApiService.getAuthStatus();
        console.log('JWT Auth status:', authStatus);
        
        if (authStatus.authenticated && authStatus.method === 'jwt') {
          console.log('Using JWT authentication');
          setUserData({
            fullName: authStatus.user.username || authStatus.user.full_name || 
                     authStatus.user.email?.split('@')[0] || '',
            email: authStatus.user.email || '',
            authMethod: 'jwt',
            userId: authStatus.user.id,
            lastLogin: authStatus.token.last_login,
            tokenExpiresAt: authStatus.token.expires_at
          });
          
          // Ensure Firebase doesn't interfere with JWT auth
          if (firebase_user && lastAuthMethod !== 'google') {
            console.log('Clearing Firebase user to prevent interference with JWT');
            if (clearUser) {
              clearUser();
            }
          }
          return;
        }
        
        // Priority 2: Check Firebase authentication only if JWT is not active
        if (firebase_user && !authStatus.authenticated) {
          console.log('Using Google/Firebase authentication');
          setUserData({
            fullName: firebase_user.displayName || firebase_user.email?.split('@')[0] || '',
            email: firebase_user.email || '',
            authMethod: 'google'
          });
          return;
        }
        
        // Priority 3: Check if we have a valid auth method preference
        if (lastAuthMethod === 'google' && firebase_user) {
          console.log('Restoring Google authentication based on preference');
          setUserData({
            fullName: firebase_user.displayName || firebase_user.email?.split('@')[0] || '',
            email: firebase_user.email || '',
            authMethod: 'google'
          });
          return;
        }
        
        // No valid authentication found
        console.log('No valid authentication found');
        setUserData({ fullName: '', email: '', authMethod: null });
        
      } catch (error) {
        console.error('Authentication error:', error);
        setUserData({ fullName: '', email: '', authMethod: null });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [firebase_user, clearUser]);

  // FIXED: Comprehensive logout that prevents auth method mixing
  const handleLogoutConfirmation = async (confirmed) => {
    setShowLogoutConfirmation(false);
    if (confirmed) {
      try {
        console.log('Starting comprehensive logout...');
        
        const lastAuthMethod = localStorage.getItem('lastAuthMethod');
        console.log('Logging out from method:', lastAuthMethod);
        
        // Step 1: Logout from Firebase/Google if it was used
        if (lastAuthMethod === 'google' || firebase_user) {
          console.log('Logging out from Firebase/Google');
          try {
            if (completeLogout) {
              await completeLogout();
            }
            if (clearUser) {
              clearUser();
            }
          } catch (firebaseError) {
            console.warn('Firebase logout failed:', firebaseError);
          }
        }
        
        // Step 2: Logout from backend/JWT
        if (lastAuthMethod === 'jwt' || ApiService.getAccessToken()) {
          console.log('Logging out from backend/JWT');
          try {
            await ApiService.logout();
          } catch (apiError) {
            console.warn('Backend logout failed:', apiError);
          }
        }
        
        // Step 3: Comprehensive cleanup - Clear ALL authentication data
        console.log('Clearing all authentication data...');
        
        // Clear localStorage completely
        const keysToRemove = [
          'userData',
          'authToken',
          'access_token',
          'refresh_token',
          'lastAuthMethod',
          'authTimestamp',
          'firebase:authUser:',
          'firebase:host:',
          'user-data',
          'google-auth-token'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Clear any Firebase-related keys that might have dynamic names
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('firebase:') || key.includes('firebase')) {
            localStorage.removeItem(key);
          }
        });
        
        // Step 4: Clear component state
        setUserData({ fullName: '', email: '', authMethod: null });
        
        // Step 5: Force Firebase signOut if still signed in
        try {
          if (firebase_user) {
            console.log('Force clearing Firebase user...');
            if (clearUser) {
              clearUser();
            }
          }
        } catch (error) {
          console.warn('Force Firebase clear failed:', error);
        }
        
        console.log('Logout completed successfully');
        navigate('/login');
        
      } catch (error) {
        console.error('Logout failed:', error);
        
        // Force cleanup even if logout fails
        localStorage.clear();
        if (clearUser) clearUser();
        setUserData({ fullName: '', email: '', authMethod: null });
        navigate('/login');
      }
    }
  };

  // Navigation handlers
  const navigateToSettings = () => {
    setUserMenuOpen(false);
    navigate("/settings");
  };

  // Toggle logout confirmation
  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setShowLogoutConfirmation(true);
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
              <div className="flex items-center ml-3 md:ml-2">
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
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getUserInitials()}
                </span>
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
                    <p className="text-xs text-blue-500 dark:text-blue-400">
                      Auth: {userData?.authMethod || 'unknown'}
                    </p>
                  </div>
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