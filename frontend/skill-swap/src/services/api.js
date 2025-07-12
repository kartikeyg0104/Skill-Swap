// API service for handling all backend communications
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('skillswap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store tokens if registration is successful
    if (response.accessToken) {
      localStorage.setItem('skillswap_token', response.accessToken);
      localStorage.setItem('skillswap_refresh_token', response.refreshToken);
    }

    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store tokens if login is successful
    if (response.accessToken) {
      localStorage.setItem('skillswap_token', response.accessToken);
      localStorage.setItem('skillswap_refresh_token', response.refreshToken);
    }

    return response;
  }

  async logout() {
    // Clear local storage
    localStorage.removeItem('skillswap_token');
    localStorage.removeItem('skillswap_refresh_token');
    localStorage.removeItem('skillswap_user');
    
    // If we implement a logout endpoint in the future
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Logout endpoint might not exist yet, so we'll ignore errors
      console.log('Logout endpoint not available, cleared local storage');
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('skillswap_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Update stored tokens
    if (response.accessToken) {
      localStorage.setItem('skillswap_token', response.accessToken);
      localStorage.setItem('skillswap_refresh_token', response.refreshToken);
    }

    return response;
  }

  async verifyEmail(token) {
    return await this.request(`/auth/verify/${token}`, {
      method: 'POST',
    });
  }

  // User methods
  async getUserProfile() {
    return await this.request('/users/profile');
  }

  async updateUserProfile(userData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserById(userId) {
    return await this.request(`/users/${userId}`);
  }

  async setAvailability(availabilityData) {
    return await this.request('/users/availability', {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    });
  }

  // Skills methods
  async addSkillOffered(skillData) {
    return await this.request('/skills/offered', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async addSkillWanted(skillData) {
    return await this.request('/skills/wanted', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async getUserSkills(userId) {
    return await this.request(`/users/${userId}`);
  }

  async deleteSkillOffered(skillId) {
    return await this.request(`/skills/offered/${skillId}`, {
      method: 'DELETE',
    });
  }

  async deleteSkillWanted(skillId) {
    return await this.request(`/skills/wanted/${skillId}`, {
      method: 'DELETE',
    });
  }

  // Swap requests methods
  async createSwapRequest(swapData) {
    return await this.request('/swap-requests', {
      method: 'POST',
      body: JSON.stringify(swapData),
    });
  }

  async getSwapRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/swap-requests?${queryString}`);
  }

  async acceptSwapRequest(swapRequestId, responseData) {
    return await this.request(`/swap-requests/${swapRequestId}/accept`, {
      method: 'PUT',
      body: JSON.stringify(responseData),
    });
  }

  async rejectSwapRequest(swapRequestId, responseData) {
    return await this.request(`/swap-requests/${swapRequestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify(responseData),
    });
  }

  async cancelSwapRequest(swapRequestId) {
    return await this.request(`/swap-requests/${swapRequestId}/cancel`, {
      method: 'PUT',
    });
  }

  // Messaging methods
  async sendMessage(messageData) {
    return await this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversations() {
    return await this.request('/messages/conversations');
  }

  async getMessagesBySwapRequest(swapRequestId) {
    return await this.request(`/messages/swap-request/${swapRequestId}`);
  }

  async getMessagesByUser(userId) {
    return await this.request(`/messages/user/${userId}`);
  }

  async markMessageAsRead(messageId) {
    return await this.request(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Reviews methods
  async createReview(swapRequestId, reviewData) {
    return await this.request(`/reviews/swap-requests/${swapRequestId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getUserReviews(userId) {
    return await this.request(`/reviews/user/${userId}`);
  }

  async getSwapRequestReviews(swapRequestId) {
    return await this.request(`/reviews/swap-request/${swapRequestId}`);
  }

  // Discovery methods
  async searchUsers(searchParams) {
    const queryString = new URLSearchParams(searchParams).toString();
    return await this.request(`/discovery/search?${queryString}`);
  }

  async getDiscoveryUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/discovery/users?${queryString}`);
  }

  async getPopularCategories() {
    return await this.request('/discovery/categories');
  }

  async getSkillSuggestions() {
    return await this.request('/discovery/suggestions');
  }

  async getFeaturedUsers() {
    return await this.request('/discovery/featured');
  }

  async getUserPublicProfile(userId) {
    return await this.request(`/discovery/profile/${userId}`);
  }

  // Social Community methods
  async createPost(postData) {
    return await this.request('/social/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPublicFeed(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/social/posts/public?${queryString}`);
  }

  async getPersonalizedFeed(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/social/feed?${queryString}`);
  }

  async likePost(postId) {
    return await this.request(`/social/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async bookmarkPost(postId) {
    return await this.request(`/social/posts/${postId}/bookmark`, {
      method: 'POST',
    });
  }

  async addComment(postId, commentData) {
    return await this.request(`/social/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async getPostComments(postId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/social/posts/${postId}/comments?${queryString}`);
  }

  async followUser(userId) {
    return await this.request(`/social/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async getFollowers(userId) {
    return await this.request(`/social/users/${userId}/followers`);
  }

  async getFollowing(userId) {
    return await this.request(`/social/users/${userId}/following`);
  }

  async getUserSocialStats(userId) {
    return await this.request(`/social/users/${userId}/stats`);
  }

  async getSuggestedUsers() {
    return await this.request('/social/suggested-users');
  }

  async getTrendingTopics() {
    return await this.request('/social/trending');
  }

  // Trust & Safety methods
  async requestVerification(verificationData) {
    return await this.request('/trust-safety/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async getVerificationStatus() {
    return await this.request('/trust-safety/verification-status');
  }

  async reportUser(reportData) {
    return await this.request('/reporting/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Gamification methods
  async getUserAchievements() {
    return await this.request('/gamification/achievements');
  }

  async getLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/leaderboard?${queryString}`);
  }

  async getUserCredits() {
    return await this.request('/gamification/credits');
  }

  // Analytics methods
  async getUserAnalytics() {
    return await this.request('/analytics/user');
  }

  async getPlatformStats() {
    return await this.request('/analytics/platform');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('Backend server is not responding');
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService;
