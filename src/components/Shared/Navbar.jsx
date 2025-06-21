import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, User, Settings, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LogoutConfirmation from "./LogoutConfirmation";
import ApiService from "../Auth/ApiService";
import { useAuthStore } from "../Auth/useAuthStore"; // Import the auth store

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

// Fixed fetchUserData function - Proper Authentication Method Detection
useEffect(() => {
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current authentication states
      const hasFirebaseUser = !!firebase_user;
      const hasBackendAuth = ApiService.isAuthenticated();
      const hasValidToken = hasBackendAuth && !ApiService.isTokenExpired(ApiService.getAccessToken());
      
      // Check for recent authentication activity to determine the active method
      const lastAuthMethod = localStorage.getItem('lastAuthMethod'); // 'google' or 'jwt'
      const authTimestamp = localStorage.getItem('authTimestamp');
      const currentTime = Date.now();
      const isRecentAuth = authTimestamp && (currentTime - parseInt(authTimestamp)) < 1000; // 1 second threshold
      
      console.log('Auth state analysis:', {
        hasFirebaseUser,
        hasBackendAuth,
        hasValidToken,
        lastAuthMethod,
        isRecentAuth,
        firebaseUserEmail: firebase_user?.email,
        tokenExists: !!ApiService.getAccessToken()
      });
      
      // Determine the active authentication method
      let activeAuthMethod = null;
      
      // If we have recent auth activity, use that method
      if (isRecentAuth && lastAuthMethod) {
        activeAuthMethod = lastAuthMethod;
        console.log(`Using recent auth method: ${activeAuthMethod}`);
      }
      // If no recent activity, determine based on current state
      else {
        // If both exist, we need to determine which one is actually active
        if (hasFirebaseUser && hasValidToken) {
          console.log('Both auth methods detected - need to determine active one');
          
          // Check if JWT token was created recently (more recent than Firebase session)
          const token = ApiService.getAccessToken();
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const tokenIssuedAt = payload.iat * 1000; // Convert to milliseconds
              const firebaseLastSignIn = firebase_user.metadata?.lastSignInTime;
              
              if (firebaseLastSignIn) {
                const firebaseTime = new Date(firebaseLastSignIn).getTime();
                activeAuthMethod = tokenIssuedAt > firebaseTime ? 'jwt' : 'google';
                console.log(`Determined active method by timestamp: ${activeAuthMethod}`);
              } else {
                // Fallback to JWT if we can't determine Firebase time
                activeAuthMethod = 'jwt';
              }
            } catch {
              activeAuthMethod = hasFirebaseUser ? 'google' : 'jwt';
            }
          } else {
            activeAuthMethod = 'jwt';
          }
        }
        // Only one method is active
        else if (hasFirebaseUser) {
          activeAuthMethod = 'google';
        }
        else if (hasValidToken) {
          activeAuthMethod = 'jwt';
        }
        else {
          activeAuthMethod = null;
        }
      }
      
      // Apply the authentication method
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
              // Try backend API first
              const user = await ApiService.getCurrentUser();
              console.log('Backend user data:', user);
              
              setUserData({
                fullName: user.username || user.full_name || user.name || user.fullName || user.displayName || user.email?.split('@')[0] || '',
                email: user.email || '',
              });
            } catch  {
              console.log('Backend API failed, decoding JWT token');
              
              // Fallback to JWT token decoding
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
          
          // Clean up if we have invalid auth states
          if (hasBackendAuth && !hasValidToken) {
            console.log('Cleaning up invalid JWT token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userData');
            localStorage.removeItem('lastAuthMethod');
            localStorage.removeItem('authTimestamp');
            navigate('/login');
          }
          break;
      }
      
    } catch (authError) {
      console.error('Authentication error:', authError);
      
      setUserData({ fullName: '', email: '' });
      
      if (authError.message.includes('401') || authError.message.includes('unauthorized')) {
        console.log('Unauthorized - clearing all auth data');
        localStorage.removeItem('authToken');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
        localStorage.removeItem('lastAuthMethod');
        localStorage.removeItem('authTimestamp');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, [navigate, firebase_user]);

// Removed unused setAuthMethod function - it's used in the Login component instead

// Updated logout to clear auth method tracking
const handleLogoutConfirmation = async (confirmed) => {
  setShowLogoutConfirmation(false);
  if (confirmed) {
    try {
      console.log('Logging out user...');
      
      const lastAuthMethod = localStorage.getItem('lastAuthMethod');
      console.log('Logout method:', lastAuthMethod);
      
      // Logout based on the last used method
      if (lastAuthMethod === 'google' && completeLogout) {
        console.log('Logging out from Firebase/Google');
        await completeLogout();
      }
      
      if (lastAuthMethod === 'jwt' || ApiService.isAuthenticated()) {
        console.log('Logging out from backend/JWT');
        try {
          await ApiService.logout();
        } catch (apiError) {
          console.warn('Backend logout failed:', apiError);
        }
      }
      
      // Clear all authentication data and tracking
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('lastAuthMethod');
      localStorage.removeItem('authTimestamp');
      
      // Clear Firebase auth state if needed
      if (clearUser) {
        clearUser();
      }
      
      setUserData({ fullName: '', email: '' });
      navigate('/login');
      
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Force cleanup
      localStorage.clear();
      if (clearUser) clearUser();
      setUserData({ fullName: '', email: '' });
      navigate('/login');
    }
  }
}; // Add firebase_user as dependency

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
  // const handleLogoutConfirmation = async (confirmed) => {
  //   setShowLogoutConfirmation(false);
  //   if (confirmed) {
  //     try {
  //       // Use the complete logout from auth store
  //       await completeLogout();
        
  //       // Additional API logout if needed
  //       try {
  //         await ApiService.logout();
  //       } catch (apiError) {
  //         console.warn('API logout failed, but continuing with logout:', apiError);
  //       }
        
  //       // Reset component state
  //       setUserData({
  //         fullName: '',
  //         email: '',
  //       });
        
  //       // Redirect to login page
  //       navigate('/login');
  //     } catch (error) {
  //       console.error('Complete logout failed:', error);
        
  //       // Fallback: manual cleanup
  //       if (clearUser) {
  //         clearUser();
  //       }
  //       localStorage.removeItem('userData');
  //       localStorage.removeItem('authToken');
        
  //       setUserData({
  //         fullName: '',
  //         email: '',
  //       });
        
  //       navigate('/login');
  //     }
  //   }
  // };

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