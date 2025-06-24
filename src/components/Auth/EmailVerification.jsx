import { useState, useEffect, useCallback } from "react";
import { Mail, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import Button from "../Shared/Button";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { useNavigate, useLocation } from "react-router-dom";
import emailjs from '@emailjs/browser';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from navigation state
  const userData = location.state?.userData;
  
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Email.js configuration from env
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Generate verification token (in real app, this comes from backend)
  const generateVerificationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Verify email with token
  const verifyEmail = useCallback(async (token, email) => {
    setIsVerifying(true);
    setError("");

    try {
      // In real app, you would call your backend API to verify the token
      const storedToken = sessionStorage.getItem('verificationToken');
      const storedEmail = sessionStorage.getItem('userEmail');

      if (token === storedToken && email === storedEmail) {
        // Verification successful
        console.log('Email verified successfully');
        
        // Clear stored verification data
        sessionStorage.removeItem('verificationToken');
        sessionStorage.removeItem('userEmail');

        // Here you would typically call your backend to mark the email as verified
        // and get the auth token
        
        // For demo purposes, we'll simulate this
        const authToken = 'demo_auth_token_' + Date.now();
        localStorage.setItem('authToken', authToken);
        
        // Redirect to dashboard
        navigate('/dashboard', { 
          state: { 
            message: 'Email verified successfully! Welcome to your dashboard.' 
          }
        });
      } else {
        setError("Invalid or expired verification token. Please request a new verification email.");
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [navigate]);

  // Send verification email
  const sendVerificationEmail = useCallback(async () => {
    if (!userData?.email) {
      setError("Email address not found. Please try signing up again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Generate verification token
      const token = generateVerificationToken();

      // Store token temporarily (in real app, this would be handled by backend)
      sessionStorage.setItem('verificationToken', token);
      sessionStorage.setItem('userEmail', userData.email);

      // Create verification link
      const verificationLink = `${window.location.origin}/verify-email?token=${token}&email=${encodeURIComponent(userData.email)}`;

      // Email template parameters
      const templateParams = {
        to_name: userData.fullName || 'User',
        to_email: userData.email,
        verification_link: verificationLink,
        verification_token: token,
        from_name: 'Your App Name', // Replace with your app name
      };

      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setEmailSent(true);
      console.log('Verification email sent successfully');

    } catch (error) {
      console.error('Failed to send verification email:', error);
      setError("Failed to send verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userData?.email, userData?.fullName, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY]);

  // Handle verification from URL params (when user clicks email link)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    if (token && email) {
      verifyEmail(token, email);
    }
  }, [location.search, verifyEmail]);

  // Send email automatically when component mounts
  useEffect(() => {
    if (userData?.email && !emailSent) {
      sendVerificationEmail();
    }
  }, [userData?.email, emailSent, sendVerificationEmail]);

  // Redirect if no user data
  if (!userData?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Invalid Access
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No email address found. Please try signing up again.
            </p>
            <Button 
              onClick={() => navigate('/signup')} 
              className="mt-4"
            >
              Back to Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {isVerifying ? (
            <LoadingSpinner size="large" />
          ) : emailSent ? (
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          ) : (
            <Mail className="mx-auto h-12 w-12 text-blue-500" />
          )}
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isVerifying ? "Verifying your email..." : "Verify your email"}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isVerifying ? (
              "Please wait while we verify your email address."
            ) : emailSent ? (
              <>
                We've sent a verification link to{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {userData.email}
                </span>
              </>
            ) : (
              "We're sending a verification link to your email address."
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {emailSent && !isVerifying && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Check your email
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <p>
                      Click the verification link in the email we sent to{" "}
                      <strong>{userData.email}</strong> to complete your registration.
                    </p>
                  </div>
                  <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                    <p>
                      The link will expire in 24 hours. Didn't receive the email? 
                      Check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={sendVerificationEmail}
                disabled={isLoading}
                variant="outline"
                fullWidth
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Resending...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend verification email
                  </div>
                )}
              </Button>

              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                fullWidth
              >
                Back to Login
              </Button>
            </div>
          </div>
        )}

        {isLoading && !emailSent && (
          <div className="text-center">
            <LoadingSpinner size="small" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sending verification email...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;