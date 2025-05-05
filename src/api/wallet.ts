// Simplified wallet interface
export const WalletAPI = {
  publicKey: null as string | null,

  // Set public key
  setPublicKey(key: string): void {
    this.publicKey = key;
    localStorage.setItem('walletPublicKey', key);
  },

  // Get public key
  getPublicKey(): string | null {
    if (!this.publicKey) {
      this.publicKey = localStorage.getItem('walletPublicKey');
    }
    return this.publicKey;
  },

  // Clear stored public key
  clearPublicKey(): void {
    this.publicKey = null;
    localStorage.removeItem('walletPublicKey');
  },

  // Connect wallet (to be implemented with actual wallet integration)
  async connect(): Promise<string | null> {
    try {
      // In a real implementation, this would connect to Phantom or other wallet
      // For now, we'll just use a mock key
      const mockKey = '0x' + Math.random().toString(16).substr(2, 40);
      this.setPublicKey(mockKey);
      return mockKey;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  },

  // Disconnect wallet
  disconnect(): void {
    this.clearPublicKey();
  }
}; 