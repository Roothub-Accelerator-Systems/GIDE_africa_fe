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

  const { firebase_user, clearUser, completeLogout } = useAuthStore();

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
        
        console.log('Auth state analysis:', {
          hasFirebaseUser,
          hasBackendAuth,
          hasValidToken,
          lastAuthMethod,
          isRecentAuth,
          firebaseUserEmail: firebase_user?.email,
          tokenExists: !!ApiService.getAccessToken()
        });
        
        let activeAuthMethod = null;
        
        // Check for recent auth first
        if (isRecentAuth && lastAuthMethod) {
          if (lastAuthMethod === 'google' && hasFirebaseUser) {
            activeAuthMethod = 'google';
            console.log('Using recent Google auth method');
          } else if (lastAuthMethod === 'jwt' && hasValidToken) {
            activeAuthMethod = 'jwt';
            console.log('Using recent JWT auth method');
          }
        }
        
        // Fallback to current state analysis
        if (!activeAuthMethod) {
          if (hasFirebaseUser && hasValidToken) {
            console.log('Both auth methods detected - preferring JWT');
            activeAuthMethod = 'jwt';
          } else if (hasFirebaseUser && !hasValidToken) {
            activeAuthMethod = 'google';
            console.log('Only Firebase auth is valid');
          } else if (!hasFirebaseUser && hasValidToken) {
            activeAuthMethod = 'jwt';
            console.log('Only JWT auth is valid');
          } else {
            activeAuthMethod = null;
            console.log('No valid authentication found');
          }
        }
        
        // Apply authentication method
        switch (activeAuthMethod) {
          case 'google':
            if (hasFirebaseUser && firebase_user) {
              console.log('Using Google/Firebase authentication');
              setUserData({
                fullName: firebase_user.displayName || firebase_user.email?.split('@')[0] || '',
                email: firebase_user.email || '',
              });
            } else {
              console.log('Google method selected but no Firebase user found');
              setUserData({ fullName: '', email: '' });
            }
            break;
            
          case 'jwt':
            if (hasValidToken) {
              console.log('Using JWT/Backend authentication');
              
              try {
                const user = await ApiService.getCurrentUser();
                console.log('Backend user data:', user);
                
                setUserData({
                  fullName: user.username || user.full_name || user.name || user.fullName || user.displayName || user.email?.split('@')[0] || '',
                  email: user.email || '',
                });
              } catch (apiError) {
                console.log('Backend API failed, decoding JWT token:', apiError);
                
                const token = ApiService.getAccessToken();
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  console.log('JWT payload data:', payload);
                  
                  setUserData({
                    fullName: payload.username || payload.full_name || payload.name || payload.email?.split('@')[0] || '',
                    email: payload.email || payload.sub || '',
                  });
                } catch (tokenError) {
                  console.error('Failed to decode JWT token:', tokenError);
                  setUserData({ fullName: '', email: '' });
                }
              }
            } else {
              console.log('JWT method selected but no valid token found');
              setUserData({ fullName: '', email: '' });
            }
            break;
            
          default:
            console.log('No active authentication method found');
            setUserData({ fullName: '', email: '' });
            
            // Clean up invalid auth states
            if (hasBackendAuth && !hasValidToken) {
              console.log('Cleaning up invalid JWT token');
              clearAllAuthData();
            }
            break;
        }
        
      } catch (authError) {
        console.error('Authentication error:', authError);
        
        setUserData({ fullName: '', email: '' });
        
        if (authError.message.includes('401') || authError.message.includes('unauthorized')) {
          console.log('Unauthorized - clearing all auth data');
          clearAllAuthData();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, firebase_user]);

  // FIXED: Centralized function to clear all auth data
  const clearAllAuthData = () => {
    console.log('Clearing all authentication data...');
    
    // Clear all localStorage items related to auth
    const authKeys = [
      'authToken',
      'access_token', 
      'refresh_token',
      'userData',
      'lastAuthMethod',    // This was missing in some logout paths
      'authTimestamp'      // This was missing in some logout paths
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared ${key} from localStorage`);
    });
  };

  // FIXED: Updated logout handler with proper cleanup
  const handleLogoutConfirmation = async (confirmed) => {
    setShowLogoutConfirmation(false);
    if (confirmed) {
      try {
        console.log('Starting logout process...');
        
        const lastAuthMethod = localStorage.getItem('lastAuthMethod');
        console.log('Last auth method:', lastAuthMethod);
        
        // Logout from Firebase if needed
        if (lastAuthMethod === 'google' || firebase_user) {
          console.log('Logging out from Firebase/Google');
          try {
            if (completeLogout) {
              await completeLogout();
            }
          } catch (firebaseError) {
            console.warn('Firebase logout failed:', firebaseError);
          }
        }
        
        // Logout from backend if needed
        if (lastAuthMethod === 'jwt' || ApiService.isAuthenticated()) {
          console.log('Logging out from backend/JWT');
          try {
            await ApiService.logout();
          } catch (apiError) {
            console.warn('Backend logout failed:', apiError);
          }
        }
        
        // FIXED: Always clear all auth data regardless of method
        clearAllAuthData();
        
        // Clear Firebase auth state
        if (clearUser) {
          clearUser();
        }
        
        // Reset component state
        setUserData({ fullName: '', email: '' });
        
        console.log('Logout completed successfully');
        navigate('/login');
        
      } catch (error) {
        console.error('Logout failed:', error);
        
        // FIXED: Force cleanup even if logout fails
        clearAllAuthData();
        if (clearUser) clearUser();
        setUserData({ fullName: '', email: '' });
        navigate('/login');
      }
    }
  };

  const navigateToSettings = () => {
    setUserMenuOpen(false);
    navigate("/settings");
  };

  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setShowLogoutConfirmation(true);
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

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {userData?.fullName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userData?.email || "Loading..."}
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

      {showLogoutConfirmation && (
        <LogoutConfirmation onConfirm={handleLogoutConfirmation} />
      )}
    </nav>
  );
};

export default Navbar;