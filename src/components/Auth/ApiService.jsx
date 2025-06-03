// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
        throw new Error(data.detail || data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // EMAIL CHECK METHODS

  // Primary method: Check if email exists using dedicated endpoint (GET)
  // async checkEmailExists(email) {
  //   try {
  //     if (!email || !/\S+@\S+\.\S+/.test(email)) {
  //       throw new Error('Please provide a valid email address');
  //     }

  //     const response = await this.makeRequest(`/auth/check-email/${encodeURIComponent(email)}`, {
  //       method: 'GET',
  //     });
      
  //     return response;
  //   } catch (error) {
  //     console.error('Email check failed:', error);
      
  //     if (error.message.includes('404') || error.message.includes('not found')) {
  //       throw new Error('Email does not exist');
  //     } else if (error.message.includes('400')) {
  //       throw new Error('Invalid email format');
  //     }
      
  //     throw error;
  //   }
  // }

  // Alternative method: Use POST request with email in body
  async checkEmailExistsPost(email) {
    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: email }),
      });
      
      return response;
    } catch (error) {
      console.error('Email check failed:', error);
      
      if (error.message.includes('404') || error.message.includes('not found')) {
        throw new Error('Email does not exist');
      } else if (error.message.includes('400')) {
        throw new Error('Invalid email format');
      }
      
      throw error;
    }
  }

  // Smart email check method that tries multiple approaches
  async checkEmailExistsSmart(email) {
    try {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      // Try the primary method first (GET endpoint)
      try {
        return await this.checkEmailExists(email);
      } catch (error) {
        console.log('Primary email check failed, trying POST method...');
        
        // If GET fails, try POST method
        try {
          return await this.checkEmailExistsPost(email);
        } catch (postError) {
          console.log('POST email check failed');
          throw postError;
        }
      }
    } catch (error) {
      console.error('All email check methods failed:', error);
      throw error;
    }
  }

  // AUTH ENDPOINTS
  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: userData.fullName,
        email: userData.email,
        password: userData.password,
      }),
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
      console.log('Making request to /auth/me...');
      const response = await this.makeRequest('/auth/me');
      console.log('getCurrentUser response:', response);
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

  // PASSWORD RESET METHODS (Backend-managed)

  // Request password reset code from backend
  async sendPasswordResetCode(email) {
    try {
      // Validate email format
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please provide a valid email address');
      }

      // Send request to backend to generate and send reset code
      const response = await this.makeRequest('/auth/forgot-password', {
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
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        throw new Error('Email address not found in our system');
      } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
        throw new Error('Too many reset requests. Please wait before requesting again.');
      } else if (error.message.includes('invalid email')) {
        throw new Error('Invalid email address provided');
      }
      
      throw new Error(error.message || 'Failed to send reset email. Please try again.');
    }
  }

  // Verify reset code with backend
  async verifyPasswordResetCode(email, code) {
    try {
      if (!email || !code) {
        throw new Error('Email and verification code are required');
      }

      if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        throw new Error('Please enter a valid 6-digit code');
      }

      const response = await this.makeRequest('/auth/verify-reset-code', {
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
      if (error.message.includes('invalid') || error.message.includes('incorrect')) {
        throw new Error('Invalid verification code');
      } else if (error.message.includes('expired')) {
        throw new Error('Verification code has expired. Please request a new one.');
      } else if (error.message.includes('attempts') || error.message.includes('limit')) {
        throw new Error('Too many verification attempts. Please request a new code.');
      }
      
      throw error;
    }
  }

  // Reset password using backend verification
  async resetPassword(email, code, newPassword) {
    try {
      if (!email || !code || !newPassword) {
        throw new Error('Email, verification code, and new password are required');
      }

      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          verification_code: code,
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
      if (error.message.includes('invalid') || error.message.includes('incorrect')) {
        throw new Error('Invalid verification code');
      } else if (error.message.includes('expired')) {
        throw new Error('Verification code has expired. Please start the reset process again.');
      } else if (error.message.includes('password')) {
        throw new Error('Password must be at least 8 characters long and meet security requirements');
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