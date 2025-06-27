import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, ArrowLeft, Loader2, Mail } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Mock ApiService for demonstration - replace with your actual ApiService
const ApiService = {
  makeRequest: async (endpoint, options) => {
    const baseURL = 'https://gide-africa-be-in9p.onrender.com';
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

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [verificationStatus, setVerificationStatus] = useState('waiting'); // 'waiting', 'checking', 'success', 'failed'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  // Check verification status with GET request
  const checkVerificationStatus = useCallback(async (verificationToken, userEmail) => {
    try {
      console.log('Checking verification status for token:', verificationToken.substring(0, 10) + '...');
      
      // Use GET request to check verification status
      const response = await ApiService.makeRequest(`/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(userEmail)}`, {
        method: 'GET'
      });

      console.log('Verification check response:', response);

      if (response.success || response.verified || response.message?.includes('success')) {
        setVerificationStatus('success');
        
        // Store auth tokens if provided
        if (response.access_token) {
          ApiService.storeTokens(response.access_token, response.refresh_token);
        }
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              message: 'Email verified successfully! Welcome to your dashboard.',
              type: 'success'
            }
          });
        }, 2000);
        
        return true; // Verification successful
      } else {
        return false; // Not yet verified
      }
    } catch (error) {
      console.error('Verification check error:', error);
      
      // Don't set error status immediately, let the timer handle it
      if (error.message.includes('404') || error.message.includes('410')) {
        // Token not found or expired - this should trigger error
        return 'expired';
      }
      
      return false; // Continue checking
    }
  }, [navigate]);

  // Start periodic verification checking
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlToken = urlParams.get('token');
    const urlEmail = urlParams.get('email');

    console.log('URL params:', { token: urlToken?.substring(0, 10) + '...', email: urlEmail });

    if (urlToken && urlEmail) {
      const decodedEmail = decodeURIComponent(urlEmail);
      setToken(urlToken);
      setEmail(decodedEmail);
      setVerificationStatus('waiting');
      
      // Start checking verification status every 5 seconds
      const checkInterval = setInterval(async () => {
        setIsLoading(true);
        setVerificationStatus('checking');
        
        const result = await checkVerificationStatus(urlToken, decodedEmail);
        
        setIsLoading(false);
        
        if (result === true) {
          // Verification successful - interval will be cleared in cleanup
          clearInterval(checkInterval);
        } else if (result === 'expired') {
          // Token expired
          clearInterval(checkInterval);
          setVerificationStatus('failed');
          setErrorMessage("Verification token has expired. Please request a new verification email.");
        } else {
          // Not yet verified, continue waiting
          setVerificationStatus('waiting');
        }
      }, 5000); // Check every 5 seconds

      // Cleanup interval on unmount
      return () => clearInterval(checkInterval);
      
    } else {
      setVerificationStatus('failed');
      setErrorMessage("Missing verification token or email address.");
    }
  }, [location.search, checkVerificationStatus]);

  // Timer countdown effect
  useEffect(() => {
    if (verificationStatus === 'waiting' || verificationStatus === 'checking') {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - show error
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
          <Mail className="mx-auto h-16 w-16 text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Please Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification email to <strong>{email}</strong>
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Please check your email and click the verification link to continue.
          </p>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              Waiting for email verification...
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
          <div className="relative">
            <Mail className="mx-auto h-16 w-16 text-blue-500" />
            <Loader2 className="absolute -bottom-2 -right-2 h-6 w-6 text-blue-500 animate-spin" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Checking Verification Status...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we check if your email has been verified.
          </p>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="inline-flex items-center">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
              <span className="text-blue-700 dark:text-blue-400 text-sm">
                Checking verification...
              </span>
            </div>
            <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
              Time remaining: {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-green-600">
            Email Verification Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your email has been successfully verified. Redirecting to dashboard...
          </p>
          <div className="mt-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Loader2 className="h-4 w-4 text-green-500 animate-spin mr-2" />
              <span className="text-green-700 dark:text-green-400 text-sm">
                Redirecting...
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
            <p>Loading: {isLoading.toString()}</p>
            <p>Time Remaining: {formatTime(timeRemaining)}</p>
            <p>Token: {token.substring(0, 20)}...</p>
            <p>Email: {email}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;