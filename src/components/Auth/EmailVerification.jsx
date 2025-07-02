import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, ArrowLeft, Loader2, Mail, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Mock ApiService for demonstration - replace with your actual ApiService
const API_BASE_URL = import.meta.env.VITE_API_URL;
const ApiService = {
  
  makeRequest: async (endpoint, options) => {
    const baseURL = API_BASE_URL;
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  storeTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  }
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100",
    ghost: "text-gray-600 hover:bg-gray-100 disabled:text-gray-400"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? 'cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Animated check mark component
const AnimatedCheckmark = () => {
  return (
    <div className="relative">
      <div className="w-16 h-16 mx-auto">
        <svg
          className="w-16 h-16 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4"
            className="animate-[draw_0.5s_ease-in-out_0.3s_forwards]"
            style={{
              strokeDasharray: '20',
              strokeDashoffset: '20',
              animation: 'draw 0.8s ease-in-out 0.5s forwards'
            }}
          />
        </svg>
      </div>
      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Animated clock component
const AnimatedClock = () => {
  return (
    <div className="relative">
      <Clock className="w-16 h-16 mx-auto text-blue-500 animate-pulse" />
      <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-spin" 
           style={{ animationDuration: '2s' }}>
        <div className="w-1 h-1 bg-blue-500 rounded-full absolute top-1 left-1/2 transform -translate-x-1/2"></div>
      </div>
    </div>
  );
};

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [verificationStatus, setVerificationStatus] = useState('waiting'); // 'waiting', 'checking', 'success', 'failed'
  const [errorMessage, setErrorMessage] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [urlToken, setUrlToken] = useState("");

  // Store token in localStorage when component mounts
  const storeVerificationToken = (token) => {
    localStorage.setItem('verificationToken', token);
    console.log('Token stored in localStorage:', token.substring(0, 10) + '...');
  };

  // Get stored token from localStorage
  const getStoredToken = () => {
    const storedToken = localStorage.getItem('verificationToken');
    console.log('Retrieved stored token:', storedToken ? storedToken.substring(0, 10) + '...' : 'null');
    return storedToken;
  };

  // Compare tokens and verify
  const verifyTokenMatch = useCallback(async (urlToken) => {
    try {
      console.log('Verifying token:', urlToken.substring(0, 10) + '...');
      
      // Make API call to verify the token
      const response = await ApiService.makeRequest(`/auth/verify-email?token=${urlToken}`, {
        method: 'GET'
      });

      console.log('Verification response:', response);

      if (response.success || response.verified || response.message?.includes('success')) {
        // Store auth tokens if provided
        if (response.access_token) {
          ApiService.storeTokens(response.access_token, response.refresh_token);
        }
        
        // Clear verification token from localStorage
        localStorage.removeItem('verificationToken');
        
        setVerificationStatus('success');
        
        // Redirect to dashboard after showing success animation
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: 'Email verified successfully! Welcome to your dashboard.',
              type: 'success'
            }
          });
        }, 3000);
        
        return true;
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      
      if (error.message.includes('404') || error.message.includes('410')) {
        setErrorMessage("Verification token has expired or is invalid. Please request a new verification email.");
      } else {
        setErrorMessage("Verification failed. Please try again or request a new verification email.");
      }
      
      setVerificationStatus('failed');
      return false;
    }
  }, [navigate]);

  // Initialize verification process
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');

    console.log('URL token:', token ? token.substring(0, 10) + '...' : 'null');

    if (token) {
      setUrlToken(token);
      
      // Store the token in localStorage
      storeVerificationToken(token);
      
      // Start verification process after a short delay to show the waiting state
      const verificationTimeout = setTimeout(async () => {
        setVerificationStatus('checking');
        await verifyTokenMatch(token);
      }, 2000);

      return () => clearTimeout(verificationTimeout);
      
    } else {
      // Check if there's a stored token
      const storedToken = getStoredToken();
      if (storedToken) {
        setUrlToken(storedToken);
        setVerificationStatus('checking');
        verifyTokenMatch(storedToken);
      } else {
        setVerificationStatus('failed');
        setErrorMessage("Missing verification token. Please use the link from your email.");
      }
    }
  }, [location.search, verifyTokenMatch]);

  // Timer countdown effect
  useEffect(() => {
    if (verificationStatus === 'waiting') {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setVerificationStatus('failed');
            setErrorMessage("Email verification timeout. Please check your email or request a new verification link.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [verificationStatus]);

  // Format time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Render verification result
  const renderVerificationResult = () => {
    if (verificationStatus === 'waiting') {
      return (
        <div className="text-center">
          <AnimatedClock />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Waiting for Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've received your verification request and are preparing to verify your email.
          </p>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              Initializing verification process...
            </p>
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
              Time remaining: {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'checking') {
      return (
        <div className="text-center">
          <AnimatedClock />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verifying Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we verify your email address...
          </p>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="inline-flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
              <span className="text-blue-700 dark:text-blue-400 text-sm">
                Verifying token...
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <AnimatedCheckmark />
          <h2 className="mt-6 text-3xl font-extrabold text-green-600 animate-fade-in">
            Email Verified Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your email has been successfully verified. Redirecting to dashboard...
          </p>
          <div className="mt-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full mr-2"></div>
              <span className="text-green-700 dark:text-green-400 text-sm">
                Redirecting to dashboard...
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'failed') {
      return (
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-red-600">
            Email Verification Required
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorMessage || "Please verify your email address to continue."}
          </p>
          
          <div className="mt-6 space-y-3">
            <Button 
              onClick={() => {
                // You can add logic here to resend verification email
                window.location.reload();
              }}
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/signup')} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign Up
            </Button>
            <Button 
              onClick={() => navigate('/login')} 
              variant="ghost"
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {renderVerificationResult()}
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Status: {verificationStatus}</p>
            <p>Time Remaining: {formatTime(timeRemaining)}</p>
            <p>URL Token: {urlToken.substring(0, 20)}...</p>
            <p>Stored Token: {getStoredToken()?.substring(0, 20)}...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;