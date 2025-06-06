import { useState, useEffect, useRef } from "react";
import { ExternalLink, ArrowLeft } from "lucide-react";
import Button from "../Shared/Button";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ChangePassword from "./ChangePassword";
import ApiService from "../Auth/ApiService";

const ForgotPassword = ({ email, onBack, onSuccess }) => {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  
  const inputRefs = useRef([]);

  // Countdown timer effect - starts when email is sent
  useEffect(() => {
    if (emailSent && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [emailSent, timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please provide a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call backend API to send reset email using /forgot endpoint
      const response = await ApiService.sendPasswordResetCode(email);
      
      console.log('Password reset code sent:', response);
      setEmailSent(true);
      setTimeLeft(1200); // Reset timer to 20 minutes
      setIsCodeVerified(false); // Reset verification status
      
      // Show success message if provided by backend
      if (response.message) {
        console.log(response.message);
      }
    } catch (error) {
      console.error('Send reset code error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-send code when component mounts
  useEffect(() => {
    if (email && !emailSent) {
      handleSendCode();
    }
  }, [email]);

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");
    setIsCodeVerified(false); // Reset verification when code changes

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste functionality
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, ''); // Remove non-digits
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError("");
      setIsCodeVerified(false);
      
      // Focus the last input after pasting
      inputRefs.current[5]?.focus();
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    if (timeLeft <= 0) {
      setError("Code has expired. Please request a new code.");
      return;
    }

    setIsVerifyingCode(true);
    setError("");

    try {
      // Call the separate verify-code endpoint
      await ApiService.verifyResetCode(email, fullCode);
      
      // If verification successful, set state and move to password change
      setIsCodeVerified(true);
      setShowChangePassword(true);
      
    } catch (error) {
      console.error('Code verification failed:', error);
      setError(error.message || 'Invalid verification code. Please try again.');
      setIsCodeVerified(false);
      
      // Clear the code inputs on failed verification
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleChangePasswordBack = () => {
    setShowChangePassword(false);
    setIsCodeVerified(false);
    // Keep the code but allow re-verification if needed
  };

  const handleChangePasswordSuccess = (data) => {
    // Call the original onSuccess callback
    if (onSuccess) {
      onSuccess(data);
    }
  };

  const openGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  // Show ChangePassword component only if code is verified
  if (showChangePassword && isCodeVerified) {
    return (
      <ChangePassword
        email={email}
        code={code.join('')}
        onBack={handleChangePasswordBack}
        onSuccess={handleChangePasswordSuccess}
      />
    );
  }

  if (isLoading && !emailSent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot Password
          </h2>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Sending reset code to <strong>{email}</strong>...
          </p>
        </div>

        {error && (
          <div className="text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={handleSendCode} fullWidth={true}>
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Check Your Email
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        We've sent a 6-digit verification code to <strong>{email}</strong>
      </p>

      {/* Gmail Link */}
      <div className="p-2 rounded-lg text-center">
        <button
          onClick={openGmail}
          className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mx-auto"
          disabled={timeLeft === 0}
        >
          <span>Open Gmail</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {/* 6-Digit Code Input */}
      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Enter 6-digit verification code 
          </label>
          <div className="flex space-x-3 justify-center" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isVerifyingCode}
                  className={`w-12 h-12 text-center text-lg font-medium bg-transparent border-0 border-b-2 ${
                    error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:border-blue-500 focus:outline-none dark:text-white disabled:opacity-50`}
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}

        {/* Success message for verified code */}
        {isCodeVerified && (
          <p className="text-sm text-green-600 dark:text-green-400 text-center">
            ✓ Code verified successfully!
          </p>
        )}

        {/* Countdown Timer */}
        <div className="text-center text-sm">
          {timeLeft > 0 ? (
            <span className="text-gray-600 dark:text-gray-400">
              Code expires in: <strong className={timeLeft <= 300 ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}>{formatTime(timeLeft)}</strong>
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400">Code has expired. Please request a new code.</span>
          )}
        </div>

        <Button 
          type="submit" 
          fullWidth={true} 
          disabled={timeLeft === 0 || code.join('').length !== 6 || isVerifyingCode}
        >
          {isVerifyingCode ? (
            <div className="flex items-center justify-center w-full">
              <LoadingSpinner size="small" color="white" />
              <span className="ml-2">Verifying Code...</span>
            </div>
          ) : (
            "Verify Code & Continue"
          )}
        </Button>
      </form>

      {timeLeft === 0 && (
        <div className="text-center">
          <button
            onClick={handleSendCode}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Request new code"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;