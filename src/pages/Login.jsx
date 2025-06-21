import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
// import { useEffect } from 'react';
import { useAuthStore } from '../components/Auth/useAuthStore'; // Adjust path as needed
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';
import ApiService from '../components/Auth/ApiService'; // Adjust the import path as needed

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [authMethod, setAuthMethod] = useState(null);
  const { signInWithGoogle, loading, error, clearError, } = useAuthStore();
  
  const isLoginPath = location.pathname === '/login';
  
  // Auto-redirect if user is already authenticated
  // useEffect(() => {
  //   if (firebase_user && !loading) {
  //     console.log('User already authenticated, redirecting to dashboard');
  //     if (onLogin) {
  //       onLogin();
  //     }
  //     navigate('/dashboard');
  //   }
  // }, [firebase_user, loading, navigate, onLogin]);
  
  const handleSubmits = () => {
    console.log('Authentication Approved');
    
    // Clear any previous errors
    clearError();
    
    // Mock successful authentication
    onLogin();
    
    // Redirect to dashboard
    navigate('/dashboard');
  };

  const handleClose = () => {
    // Clear any errors when closing
    navigate('/');
  };

  // Add this function to your Login component (paste.txt - second file)

// Helper function to set authentication method - ADD THIS TO YOUR LOGIN COMPONENT
const setAuthMethod = (method) => {
  localStorage.setItem('lastAuthMethod', method);
  localStorage.setItem('authTimestamp', Date.now().toString());
};

// Updated handleSubmit for traditional login (JWT)
const handleSubmit = () => {
  console.log('JWT Authentication Approved');
  
  // Clear any previous errors
  clearError();
  
  // Set authentication method to JWT
  setAuthMethod('jwt');
  
  // Mock successful authentication
  onLogin();
  
  // Redirect to dashboard
  navigate('/dashboard');
};

// Updated handleGoogleSignIn
const handleGoogleSignIn = async () => {
  try {
    // Clear any existing auth method tracking
    localStorage.removeItem('lastAuthMethod');
    localStorage.removeItem('authTimestamp');
    
    // First, authenticate with Firebase/Google
    const user = await signInWithGoogle();
    
    if (user) {
      // Set authentication method to Google IMMEDIATELY after successful Firebase auth
      setAuthMethod('google');
      
      try {
        let backendResponse;
        
        // Use different endpoints based on the current path
        if (isLoginPath) {
          console.log('Using Google Sign-In endpoint for login');
          backendResponse = await ApiService.makeRequest('/auth/google-sign-in', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              id_token: user.accessToken,
            }),
          });
        } else {
          console.log('Using Google Sign-Up endpoint for signup');
          backendResponse = await ApiService.makeRequest('/auth/google-sign-up', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
              id_token: user.accessToken,
            }),
          });
        }

        if (backendResponse) {
          console.log('Backend Google auth response:', backendResponse);
          
          // Store auth token if provided, but don't change the auth method
          if (backendResponse.access_token || backendResponse.token) {
            localStorage.setItem('authToken', backendResponse.access_token || backendResponse.token);
          }
          
          // Store user data if provided
          if (backendResponse.user) {
            localStorage.setItem('userData', JSON.stringify(backendResponse.user));
          }
        }
      } catch (backendError) {
        console.error('Backend Google authentication failed:', backendError);
        // Continue with Google auth even if backend fails
      }
      
      // Always redirect on successful Firebase auth
      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Google sign-in process failed:', error);
    // Remove the auth method if Google sign-in failed
    localStorage.removeItem('lastAuthMethod');
    localStorage.removeItem('authTimestamp');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 relative">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl 
                   text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 
                   transition-all duration-200 hover:scale-105 z-10"
        aria-label="Close login page"
      >
        <svg 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </button>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLoginPath ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLoginPath ? "Don't have an account?" : "Already have an account?"}
            <Link
              to={isLoginPath ? '/signup' : '/login'}
              className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={clearError} // Clear errors when switching forms
            >
              {isLoginPath ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 transition-colors duration-200">
          {isLoginPath ? (
            <LoginForm onSubmit={handleSubmit} setAuthMethod={setAuthMethod}
/>
          ) : (
            <SignupForm onSubmit={handleSubmit} />
          )}
          
          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200"
                  aria-label="Dismiss error"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or 
                </span>
              </div>
            </div>
            
            {/* Google Sign In Button */}
            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 
                         rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 
                         hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Google</span>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our{' '}
              <Link to="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;