import { useState, useEffect, useCallback } from "react";
import { Mail, CheckCircle, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import Button from "../Shared/Button";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { useNavigate, useLocation } from "react-router-dom";
import emailjs from '@emailjs/browser';
import ApiService from '../Auth/ApiService'; // Import your API service

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data from navigation state
  const userData = location.state?.userData;
  
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);

  // Email.js configuration from env
  const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Generate verification token from backend
  const generateVerificationToken = useCallback(async () => {
    try {
      // Add this endpoint to your ApiService
      const response = await ApiService.makeRequest('/auth/generate-verification-token', {
        method: 'POST',
        body: JSON.stringify({
          email: userData?.email
        })
      });
      
      return response.token;
    } catch (error) {
      console.error('Failed to generate verification token:', error);
      throw new Error('Failed to generate verification token');
    }
  }, [userData?.email]);

  // Verify email with token via backend
  const verifyEmail = useCallback(async (token, email) => {
    setIsVerifying(true);
    setError("");

    try {
      // Call backend to verify the token
      const response = await ApiService.makeRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          token: token,
          email: email
        })
      });

      if (response.success) {
        console.log('Email verified successfully');
        
        // Store auth tokens if provided
        if (response.access_token) {
          ApiService.storeTokens(response.access_token, response.refresh_token);
        }
        
        // Redirect to dashboard with success message
        navigate('/dashboard', { 
          state: { 
            message: 'Email verified successfully! Welcome to your dashboard.',
            type: 'success'
          }
        });
      } else {
        setError(response.message || "Invalid or expired verification token. Please request a new verification email.");
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [navigate]);

  // Send verification email with EmailJS
  const sendVerificationEmail = useCallback(async () => {
    if (!userData?.email) {
      setError("Email address not found. Please try signing up again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Generate verification token from backend
      const token = await generateVerificationToken();
      setVerificationToken(token);

      // Create verification link
      const verificationLink = `${window.location.origin}/verify-email?token=${token}&email=${encodeURIComponent(userData.email)}`;

      // Enhanced email template parameters
      const templateParams = {
        to_name: userData.fullName || userData.full_name || 'User',
        to_email: userData.email,
        verification_link: verificationLink,
        verification_token: token,
        from_name: 'CoverCraft AI', // Replace with your app name
        app_name: 'CoverCraft AI',
        company_name: 'CoverCraft',
        support_email: 'support@covercraft.ai', // Replace with your support email
        // Add styling variables for the email template
        primary_color: '#3B82F6',
        secondary_color: '#1F2937',
        accent_color: '#10B981',
        // Add branding
        logo_url: `${window.location.origin}/logo.png`, // Add your logo URL
        brand_tagline: 'AI-Powered Cover Letter Generation',
        
        // Email content customization
        email_subject: 'Verify Your Email Address - CoverCraft AI',
        email_greeting: `Hi ${userData.fullName || userData.full_name || 'there'}!`,
        email_intro: 'Welcome to CoverCraft AI! We\'re excited to have you on board.',
        email_instruction: 'To complete your registration and start creating amazing cover letters, please verify your email address by clicking the button below:',
        verification_button_text: 'Verify Email Address',
        email_footer: 'If you didn\'t create an account with CoverCraft AI, you can safely ignore this email.',
        
        // Security notice
        security_note: 'This verification link will expire in 24 hours for your security.',
        manual_link_text: 'If the button doesn\'t work, copy and paste this link into your browser:',
        
        // Contact info
        contact_text: 'Need help? Contact our support team at support@covercraft.ai',
      };

      console.log('Sending verification email with params:', {
        ...templateParams,
        verification_link: '[HIDDEN]',
        verification_token: '[HIDDEN]'
      });

      // Send email using EmailJS with enhanced error handling
      const emailResponse = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (emailResponse.status === 200) {
        setEmailSent(true);
        console.log('Verification email sent successfully');
      } else {
        throw new Error('Failed to send email');
      }

    } catch (error) {
      console.error('Failed to send verification email:', error);
      
      // Provide specific error messages
      if (error.message.includes('generate verification token')) {
        setError("Failed to generate verification token. Please try again or contact support.");
      } else if (error.message.includes('EmailJS')) {
        setError("Failed to send verification email. Please check your internet connection and try again.");
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError("Failed to send verification email. Please try again or contact support if the problem persists.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [userData?.email, userData?.fullName, userData?.full_name, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, generateVerificationToken]);

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
    if (userData?.email && !emailSent && !isLoading) {
      sendVerificationEmail();
    }
  }, [userData?.email, emailSent, isLoading, sendVerificationEmail]);

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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
            
            {/* Add back to signup button when there's an error */}
            <div className="mt-4 flex flex-col space-y-2">
              <Button
                onClick={() => navigate('/signup')}
                variant="outline"
                size="sm"
                className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign Up
              </Button>
              <Button
                onClick={() => setError("")}
                variant="ghost"
                size="sm"
                className="w-full text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {emailSent && !isVerifying && !error && (
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
                      Check your spam folder or click the resend button below.
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
              
              <Button
                onClick={() => navigate('/signup')}
                variant="ghost"
                fullWidth
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign Up
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