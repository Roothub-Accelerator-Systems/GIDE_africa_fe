import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react";
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
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Verify email with token via backend
  const verifyEmail = useCallback(async (token, email) => {
    setIsLoading(true);
    setVerificationStatus('verifying');
    setErrorMessage("");

    try {
      console.log('Verifying email with token:', token.substring(0, 10) + '...');
      
      // Call backend to verify the token - this is the ONLY API call needed
      const response = await ApiService.makeRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          email: email
        })
      });

      console.log('Verification response:', response);

      if (response.success || response.message?.includes('success')) {
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
        
      } else {
        setVerificationStatus('failed');
        setErrorMessage(response.message || "Invalid or expired verification token.");
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('failed');
      
      // Handle specific error cases
      if (error.message.includes('400')) {
        setErrorMessage("Invalid verification token format.");
      } else if (error.message.includes('404')) {
        setErrorMessage("Verification token not found or expired.");
      } else if (error.message.includes('410')) {
        setErrorMessage("Verification token has expired.");
      } else if (error.message.includes('409')) {
        setErrorMessage("Email is already verified.");
      } else {
        setErrorMessage("Verification failed. Please try again or contact support.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Handle verification from URL params (when user clicks email link)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    console.log('URL params:', { token: token?.substring(0, 10) + '...', email });

    if (token && email) {
      // Decode email if it's URL encoded
      const decodedEmail = decodeURIComponent(email);
      verifyEmail(token, decodedEmail);
    } else {
      setVerificationStatus('failed');
      setErrorMessage("Missing verification token or email address.");
      setIsLoading(false);
    }
  }, [location.search, verifyEmail]);

  // Render verification result
  const renderVerificationResult = () => {
    if (verificationStatus === 'verifying' && isLoading) {
      return (
        <div className="text-center">
          <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verifying your email...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we verify your email address.
          </p>
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
            Email Verification Failed
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorMessage || "We couldn't verify your email address."}
          </p>
          
          <div className="mt-6 space-y-3">
            <Button 
              onClick={() => navigate('/signup')} 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign Up
            </Button>
            <Button 
              onClick={() => navigate('/login')} 
              variant="outline"
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
            <p>Token: {new URLSearchParams(location.search).get('token')?.substring(0, 20)}...</p>
            <p>Email: {decodeURIComponent(new URLSearchParams(location.search).get('email') || '')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;