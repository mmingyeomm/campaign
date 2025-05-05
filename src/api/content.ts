import axios from 'axios';
import { CONFIG } from './config';

// Content type definition
export interface Content {
  id: number;
  content: string;
  imageURL?: string;
  walletAddress: string;
  senderId: string;
  communityId: string;
  createdAt: string;
}

// Content API service
export const ContentAPI = {
  // Fetch all contents from API
  async fetchAllContents(): Promise<Content[]> {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await axios.get(`${CONFIG.api.content()}?t=${timestamp}`);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch content:', error);
      return [];
    }
  },

  // Format date string
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Return empty string if date is invalid
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString();
  },

  // Format wallet address (first 6 chars...last 4 chars)
  formatWalletAddress(address: string): string {
    if (!address) return 'Unknown';
    if (address.length <= 10) return address;
    
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  },

  // Submit new content
  async submitContent(text: string, imageUrl?: string, walletAddress?: string): Promise<any> {
    const requestData = {
      content: text,
      senderId: CONFIG.fixed.senderId,
      communityId: CONFIG.fixed.communityId,
      imageURL: imageUrl || null,
      walletAddress: walletAddress || CONFIG.fixed.walletAddress
    };
    
    console.log('Sending data to API:', requestData);
    
    try {
      const response = await axios.post(CONFIG.api.content(), requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}; 