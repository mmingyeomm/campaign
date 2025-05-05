'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ContentAPI, Content } from '@/api/content';
import { WalletAPI } from '@/api/wallet';
import { TimerAPI, TimerState } from '@/api/timer';
import { CloudinaryAPI } from '@/api/cloudinary';
import { CommunityAPI, Community } from '@/api/community';
import { CONFIG } from '@/api/config';

export default function SoonCommunity() {
  // State for wallet connection
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<TimerState>({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  const [community, setCommunity] = useState<Community | null>(null);
  
  // Post content state
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<Content[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize wallet and load data
  useEffect(() => {
    // Check if wallet is already connected
    const storedKey = WalletAPI.getPublicKey();
    if (storedKey) {
      setWalletConnected(true);
      setWalletAddress(storedKey);
    }
    
    // Load initial content
    loadContent();
    
    // Fetch community info (to get dynamic timeLimit)
    CommunityAPI.fetchCommunityById(CONFIG.fixed.communityId)
      .then(c => { if (c) setCommunity(c); })
      .catch(console.error);
    
    // Set up auto-refresh (every 10 seconds)
    const refreshInterval = setInterval(() => {
      loadContent();
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Update the timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Initial timer update
    updateTimer();
    
    // Set up timer that updates every second
    timer = setInterval(() => {
      updateTimer();
    }, 1000);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [posts, community]);

  // Function to update the timer based on the latest post
  const updateTimer = () => {
    const now = new Date();
    let remainingSec: number;
    if (community) {
      if (posts.length === 0) {
        // No posts yet, start full timeLimit
        remainingSec = community.timeLimit * 60;
      } else {
        // Get the latest post timestamp
        const latestPost = [...posts].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        const elapsed = Math.floor((now.getTime() - new Date(latestPost.createdAt).getTime()) / 1000);
        remainingSec = Math.max(0, community.timeLimit * 60 - elapsed);
      }
      setTimeLeft(TimerAPI.secondsToHMS(remainingSec));
    } else {
      // Fallback to existing behavior if community not loaded
      if (posts.length === 0) {
        setTimeLeft(TimerAPI.getInitialState());
      } else {
        setTimeLeft(TimerAPI.calculateTimeLeft(posts[0].createdAt));
      }
    }
  };

  // Load content from API
  const loadContent = async () => {
    try {
      setLoading(true);
      const contents = await ContentAPI.fetchAllContents();
      
      // Sort by createdAt in descending order (newest first)
      contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setPosts(contents);
      
      // Update timer based on latest post
      if (contents.length > 0) {
        const newTimeLeft = TimerAPI.calculateTimeLeft(contents[0].createdAt);
        setTimeLeft(newTimeLeft);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      const publicKey = await WalletAPI.connect();
      if (publicKey) {
        setWalletConnected(true);
        setWalletAddress(publicKey);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    WalletAPI.disconnect();
    setWalletConnected(false);
    setWalletAddress(null);
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setContent('');
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle post submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    setSubmitting(true);
    
    try {
      let imageUrl: string | undefined = undefined;
      
      // Upload image to Cloudinary if one is selected
      if (imageFile && walletAddress) {
        try {
          imageUrl = await CloudinaryAPI.uploadImage(imageFile, walletAddress);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Ask if user wants to continue without the image
          if (!confirm('Image upload failed. Do you want to continue without the image?')) {
            setSubmitting(false);
            return; // Stop submission if user cancels
          }
        }
      }
      
      // Submit content with image URL if available
      await ContentAPI.submitContent(content, imageUrl, walletAddress || undefined);
      
      // Reset the form
      resetForm();
      
      // Reload content
      await loadContent();
      
      // Show success message
      alert('Content submitted successfully!');
    } catch (error) {
      console.error('Error submitting content:', error);
      alert('Failed to submit content. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Pulse Logo"
              width={120}
              height={40}
              className="cursor-pointer"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                <li><Link href="/" className="hover:text-blue-400 transition">Home</Link></li>
                <li><Link href="/soon" className="text-blue-400 font-bold">Soon</Link></li>
                <li><Link href="/round3" className="hover:text-blue-400 transition">Round 3</Link></li>
              </ul>
            </nav>
            <button
              onClick={walletConnected ? handleDisconnectWallet : handleConnectWallet}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm font-medium transition"
            >
              {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background.png"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
                Soon Community Campaign
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Join our community bootstrapper campaign for Soon and earn rewards by posting quality content. The clock is ticking!
              </p>
              
              {/* Timer Display */}
              <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-md p-6 rounded-xl mb-8 border border-blue-500/30 shadow-lg">
                <h3 className="text-xl font-medium mb-4 text-blue-300">Reward Timer</h3>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-blue-900/50 rounded-lg w-16 h-16 flex items-center justify-center border border-blue-500/20">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-blue-300">HOURS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-blue-900/50 rounded-lg w-16 h-16 flex items-center justify-center border border-blue-500/20">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-blue-300">MINUTES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-blue-900/50 rounded-lg w-16 h-16 flex items-center justify-center border border-blue-500/20">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-blue-300">SECONDS</div>
                  </div>
                </div>
                <p className="text-sm mt-4 text-center text-gray-300">
                  Last poster when timer expires wins the round's rewards!
                </p>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-8 rounded-xl border border-blue-500/30 shadow-lg">
                  <div className="flex items-center mb-6">
                    <div className="relative w-20 h-20 mr-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">S</div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Soon Community</h3>
                      <p className="text-blue-300">Featured Project</p>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-6">
                    Soon is an innovative platform designed to revolutionize community interactions. Join our campaign to help promote this cutting-edge project.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-900/30 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-300">500</div>
                      <div className="text-xs text-gray-300">PULSE Tokens</div>
                    </div>
                    <div className="bg-blue-900/30 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-300">{posts.length}</div>
                      <div className="text-xs text-gray-300">Participants</div>
                    </div>
                  </div>
                  <a 
                    href="https://soon.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-center rounded-lg font-bold text-sm transition duration-300"
                  >
                    Learn More About Soon
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Posting Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/80 to-blue-900/20 relative">
        <div className="absolute inset-0 bg-[url('/images/background.png')] opacity-5 bg-fixed"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              Post About Soon
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          {/* Post Form */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 mb-4 border border-blue-500/20 shadow-lg">
              <textarea
                className="w-full bg-blue-900/40 border border-blue-500/30 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Share your thoughts about Soon..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              
              {/* Image Upload */}
              <div className="mt-4 mb-4">
                <div className="flex items-center">
                  <label className="block cursor-pointer px-4 py-2 bg-blue-900/50 text-blue-300 rounded-lg hover:bg-blue-800/60 transition">
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="ml-2 px-3 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-800/60 transition text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="mt-3">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-32 rounded-lg border border-blue-500/30"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  {!walletConnected && (
                    <p className="text-sm text-red-400">
                      Please connect your wallet to post content
                    </p>
                  )}
                  {walletConnected && (
                    <p className="text-sm text-blue-300">
                      Connected: {ContentAPI.formatWalletAddress(walletAddress || '')}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting || !content.trim() || !walletConnected}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    submitting || !content.trim() || !walletConnected
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {submitting ? 'Posting...' : 'Post Content'}
                </button>
              </div>
            </div>
          </form>
          
          {/* Posts Feed */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6 text-blue-300">Recent Community Posts</h3>
            
            {loading && (
              <div className="py-8 text-center text-gray-400">
                Loading posts...
              </div>
            )}
            
            {!loading && posts.length === 0 && (
              <div className="py-8 text-center text-gray-400">
                Be the first to post content about Soon!
              </div>
            )}
            
            {posts.map((post) => (
              <div key={post.id} className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border border-blue-500/30">
                    <span className="font-bold text-white">{ContentAPI.formatWalletAddress(post.walletAddress).charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-300">{ContentAPI.formatWalletAddress(post.walletAddress)}</h4>
                    <p className="text-xs text-gray-400">
                      {ContentAPI.formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-200">{post.content}</p>
                
                {post.imageURL && (
                  <div className="mt-4">
                    <img 
                      src={post.imageURL} 
                      alt="Content" 
                      className="max-h-60 rounded-lg border border-blue-500/20"
                    />
                  </div>
                )}
                
                <div className="flex gap-4 mt-4">
                  <button className="text-gray-400 text-sm hover:text-blue-400 transition">Like</button>
                  <button className="text-gray-400 text-sm hover:text-blue-400 transition">Reply</button>
                  <button className="text-gray-400 text-sm hover:text-blue-400 transition">Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-20 bg-gradient-to-b from-blue-900/20 to-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              Campaign Rewards
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 p-8 rounded-xl shadow-lg hover:border-blue-500/50 transition duration-300">
              <h3 className="text-2xl font-bold mb-6 text-blue-300">Winner Rewards</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">500 PULSE Tokens</span>
                    <p className="text-sm text-gray-300">Transferable cryptocurrency with real value</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Exclusive NFT Badge</span>
                    <p className="text-sm text-gray-300">Unique digital collectible marking your achievement</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Priority Access</span>
                    <p className="text-sm text-gray-300">First access to future Pulse campaigns and features</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Featured Profile</span>
                    <p className="text-sm text-gray-300">Highlighted profile on the Pulse platform</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 p-8 rounded-xl shadow-lg hover:border-blue-500/50 transition duration-300">
              <h3 className="text-2xl font-bold mb-6 text-blue-300">Active Participant Rewards</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">50 PULSE Tokens per quality post</span>
                    <p className="text-sm text-gray-300">Earn as you contribute valuable content</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Community Badges</span>
                    <p className="text-sm text-gray-300">Tiered badges based on your contribution level</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Future Campaign Selection</span>
                    <p className="text-sm text-gray-300">Opportunity to be selected for exclusive campaigns</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Early Access Features</span>
                    <p className="text-sm text-gray-300">Preview and test new Pulse platform features</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-xl mb-8 text-blue-300">Don't miss your chance to participate in this exciting campaign!</p>
            <a href="#top" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full font-bold text-lg inline-block transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Posting Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 py-10 border-t border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Image
                src="/images/logo.png"
                alt="Pulse Logo"
                width={100}
                height={30}
              />
              <p className="mt-2 text-blue-300">Empowering communities through engagement</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">Twitter</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">Discord</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">Medium</a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">GitHub</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Pulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 