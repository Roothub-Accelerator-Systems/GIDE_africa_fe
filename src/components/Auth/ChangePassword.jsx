import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import Button from "../Shared/Button";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ApiService from "../Auth/ApiService";

const ChangePassword = ({ email, code, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
    general: ""
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
        general: ""
      });
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPasswords(!showPasswords);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { newPassword: "", confirmPassword: "", general: "" };
    
    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain uppercase, lowercase, and number";
      valid = false;
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({ newPassword: "", confirmPassword: "", general: "" });
    setSuccessMessage("");
    
    try {
      // Call backend API to reset password using /reset endpoint
      // This endpoint verifies the code and resets the password in one call
      const response = await ApiService.resetPassword(
        email,
        code,
        formData.newPassword
      );

      console.log('Password reset successful:', response);
      
      // Show success message
      const message = response.message || 'Password changed successfully';
      setSuccessMessage(message);
      
      // Reset form
      setFormData({
        newPassword: "",
        confirmPassword: ""
      });
      setIsSubmitted(false);
      
      // Call success callback with response data
      if (onSuccess) {
        onSuccess({ 
          email, 
          message: message,
          data: response
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Handle specific error cases based on FastAPI backend responses
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.message.includes('Invalid or expired reset code')) {
        errorMessage = 'Reset code is invalid or expired. Please request a new code.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'User account not found. Please check your email address.';
      } else if (error.message.includes('password update failed')) {
        errorMessage = 'Failed to update password. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({
        ...errors,
        general: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) return { label: 'Weak', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-200 dark:bg-red-900' };
    if (strength <= 3) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-200 dark:bg-yellow-900' };
    if (strength <= 4) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-200 dark:bg-blue-900' };
    return { label: 'Strong', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-200 dark:bg-green-900' };
  };

  const passwordStrength = formData.newPassword ? getPasswordStrength(formData.newPassword) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Password
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        Create a new password for <strong>{email}</strong>
      </p>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
        </div>
      )}

      {errors.general && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <div className="mt-1 relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPasswords ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              onBlur={() => isSubmitted && validateForm()}
              disabled={isLoading}
              className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white pr-10 disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none disabled:opacity-50"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              tabIndex="-1"
            >
              {showPasswords ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.newPassword && passwordStrength && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-200 ${passwordStrength.bg}`}
                    style={{ width: `${(passwordStrength.label === 'Weak' ? 20 : 
                                      passwordStrength.label === 'Fair' ? 40 : 
                                      passwordStrength.label === 'Good' ? 70 : 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
          
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
          )}
          
          {/* Password Requirements */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <p>Password must contain:</p>
            <ul className="mt-1 space-y-1">
              <li className={`flex items-center space-x-1 ${formData.newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                {formData.newPassword.length >= 8 ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-gray-300" />}
                <span>At least 8 characters</span>
              </li>
              <li className={`flex items-center space-x-1 ${/[A-Z]/.test(formData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                {/[A-Z]/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-gray-300" />}
                <span>One uppercase letter</span>
              </li>
              <li className={`flex items-center space-x-1 ${/[a-z]/.test(formData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                {/[a-z]/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-gray-300" />}
                <span>One lowercase letter</span>
              </li>
              <li className={`flex items-center space-x-1 ${/\d/.test(formData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                {/\d/.test(formData.newPassword) ? <Check className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-gray-300" />}
                <span>One number</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <div className="mt-1 relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => isSubmitted && validateForm()}
              disabled={isLoading}
              className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="Confirm new password"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> This will reset your password using the verification code sent to your email.
          </p>
        </div>

        <Button 
          type="submit" 
          fullWidth={true} 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <LoadingSpinner size="small" color="white" />
              <span className="ml-2">Updating Password...</span>
            </div>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;