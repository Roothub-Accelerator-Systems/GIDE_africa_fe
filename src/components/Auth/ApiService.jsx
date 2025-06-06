// services/api.js - Updated with separate verify and reset endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token && !token.startsWith('mock-')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // Handle error message extraction more robustly
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        if (data) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            // Handle FastAPI validation errors which return an array
            const errors = data.detail.map(err => {
              if (err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return err.msg || err.message || JSON.stringify(err);
            });
            errorMessage = errors.join(', ');
          } else if (typeof data.message === 'string') {
            errorMessage = data.message;
          } else if (data.detail && typeof data.detail === 'object') {
            errorMessage = JSON.stringify(data.detail);
          } else if (data.message && typeof data.message === 'object') {
            errorMessage = JSON.stringify(data.message);
          }
        }
        
        console.error('API Error Response:', { status: response.status, data, url, config });
        throw new Error(errorMessage);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // EMAIL CHECK METHODS

  // Primary method: Check if email exists using the new dedicated endpoint
  async checkEmailExists(email) {
    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      const response = await this.makeRequest(`/auth/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      
      return response;
    } catch (error) {
      console.error('Email check failed:', error);
      throw error;
    }
  }

  // AUTH ENDPOINTS
  async register(userData) {
    const payload = {
      username: userData.fullName, // Use fullName as username
      full_name: userData.fullName,
      email: userData.email,
      password: userData.password,
    };
    
    console.log('Registration payload being sent:', payload);
    console.log('Original userData:', userData);
    
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
  }

  async googleSignin(idToken) {
    return this.makeRequest('/auth/google-signin', {
      method: 'POST',
      body: JSON.stringify({
        id_token: idToken,
      }),
    });
  }

  // USER PROFILE MANAGEMENT
  async getCurrentUser() {
    try {
      console.log('Making request to fetch data');
      const response = await this.makeRequest('/dashboard/me');
      console.log('getCurrentUser response');
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  async updateUserProfile(profileData) {
    try {
      const response = await this.makeRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return response;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async logout() {
    try {
      // Call backend logout endpoint if it exists
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Backend logout failed:', error);
      // Continue with local cleanup even if backend logout fails
    } finally {
      // Clear local storage regardless
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token && !token.startsWith('mock-');
  }

  // Get stored auth token
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // PASSWORD RESET METHODS (Updated to use separate endpoints)

  // Step 1: Request password reset code using /forgot endpoint
  async sendPasswordResetCode(email) {
    try {
      // Validate email format
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please provide a valid email address');
      }
      
      // Send request to backend /forgot endpoint to generate and send reset code
      const response = await this.makeRequest('/password-reset/forgot', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
        }),
      });
      
      return {
        message: response.message || 'Reset code sent to your email successfully',
        status: 'success'
      };
      
    } catch (error) {
      console.error('Failed to send reset email:', error);
      
      // Handle specific backend error messages
      if (error.message.includes('not found') || error.message.includes('User not found')) {
        throw new Error('Email address not found in our system');
      } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
        throw new Error('Too many reset requests. Please wait before requesting again.');
      } else if (error.message.includes('invalid email')) {
        throw new Error('Invalid email address provided');
      }
      
      throw new Error(error.message || 'Failed to send reset email. Please try again.');
    }
  }

  // Step 2: Verify reset code using /verify-code endpoint
  async verifyResetCode(email, code) {
    try {
      if (!email || !code) {
        throw new Error('Email and verification code are required');
      }

      if (code.length !== 6) {
        throw new Error('Verification code must be 6 digits');
      }
      
      const response = await this.makeRequest('/password-reset/verify-code', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          code: code,
        }),
      });
      
      return {
        message: response.message || 'Code verified successfully',
        status: 'success',
        ...response
      };
      
    } catch (error) {
      console.error('Code verification failed:', error);
      
      // Handle specific backend error messages
      if (error.message.includes('Invalid or expired reset code')) {
        throw new Error('Invalid or expired verification code. Please request a new code.');
      } else if (error.message.includes('User not found')) {
        throw new Error('User account not found. Please check your email address.');
      } else if (error.message.includes('Code expired')) {
        throw new Error('Verification code has expired. Please request a new code.');
      }
      
      throw error;
    }
  }

  // Step 3: Reset password using /reset endpoint (requires verified code)
  async resetPassword(email, code, newPassword) {
    try {
      if (!email || !code || !newPassword) {
        throw new Error('Email, verification code, and new password are required');
      }
      
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      const response = await this.makeRequest('/password-reset/reset', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          code: code,
          new_password: newPassword,
        }),
      });
      
      return {
        message: response.message || 'Password updated successfully',
        status: 'success',
        ...response
      };
      
    } catch (error) {
      console.error('Password reset failed:', error);
      
      // Handle specific backend error messages
      if (error.message.includes('Invalid or expired reset code')) {
        throw new Error('Invalid or expired verification code. Please request a new code.');
      } else if (error.message.includes('User not found')) {
        throw new Error('User account not found. Please check your email address.');
      } else if (error.message.includes('password update failed') || error.message.includes('Password update failed')) {
        throw new Error('Failed to update password. Please try again.');
      }
      
      throw error;
    }
  }

  // USER PROFILE ENDPOINTS
  async getUserProfile() {
    return this.makeRequest('/users/profile');
  }
}

export default new ApiService();