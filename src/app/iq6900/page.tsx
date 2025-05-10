'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ContentAPI, Content } from '@/api/content';
import { WalletAPI } from '@/api/wallet';
import { TimerAPI, TimerState } from '@/api/timer';
import { CloudinaryAPI } from '@/api/cloudinary';
import { CommunityAPI, Community } from '@/api/community';
// CONFIG is not used directly for community ID here, as it's hardcoded for IQ6900

const IQ6900_COMMUNITY_ID = "a8f3e6d1-7b92-4c5f-9e48-d67f0a2b3c4e";

export default function IQ6900Community() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState<TimerState>({
    hours: 0, // Initialized to 0, will be updated by timer logic
    minutes: 0,
    seconds: 0
  });
  const [community, setCommunity] = useState<Community | null>(null);
  
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<Content[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedKey = WalletAPI.getPublicKey();
    if (storedKey) {
      setWalletConnected(true);
      setWalletAddress(storedKey);
    }
    
    loadContentAndCommunity();
    
    const refreshInterval = setInterval(() => {
      loadContentAndCommunity(); // Refresh both content and community for timer
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (community && community.timeLimit) {
      updateTimer(); // Initial update
      timerInterval = setInterval(updateTimer, 1000); // Update timer every second
    }
    return () => clearInterval(timerInterval);
  }, [posts, community]);

  const loadContentAndCommunity = async () => {
    setLoading(true);
    try {
      // Fetch community info first or in parallel
      const fetchedCommunity = await CommunityAPI.fetchCommunityById(IQ6900_COMMUNITY_ID);
      if (fetchedCommunity) {
        setCommunity(fetchedCommunity);
        console.log("Loaded IQ6900 community data:", fetchedCommunity);
      } else {
        console.error('IQ6900 Community not found');
        // Handle case where community info isn't found
      }

      // Fetch content specific to IQ6900 community
      const contents = await ContentAPI.fetchAllContents(IQ6900_COMMUNITY_ID);
      console.log("Fetched contents for IQ6900:", contents);
      
      // Double-check that we only have IQ6900 content by filtering
      const filteredContents = contents.filter(content => content.communityId === IQ6900_COMMUNITY_ID);
      if (filteredContents.length !== contents.length) {
        console.warn(`Filtered out ${contents.length - filteredContents.length} posts that didn't belong to IQ6900 community`);
      }
      
      // Sort by newest first
      filteredContents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(filteredContents);

    } catch (error) {
      console.error('Error loading data for IQ6900:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateTimer = () => {
    // Use default timeLimit of 120 minutes if the community timeLimit is null
    // This matches the Orca community's timeLimit from the provided data
    const defaultTimeLimit = 120;
    
    if (!community) {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const timeLimit = community.timeLimit || defaultTimeLimit;
    const now = new Date().getTime();
    let remainingSec: number;

    if (posts.length > 0 && posts[0].createdAt) {
      const lastPostTime = new Date(posts[0].createdAt).getTime();
      const elapsedSeconds = Math.floor((now - lastPostTime) / 1000);
      remainingSec = Math.max(0, timeLimit * 60 - elapsedSeconds);
    } else {
      // If no posts yet, show the full time limit
      remainingSec = timeLimit * 60;
    }
    setTimeLeft(TimerAPI.secondsToHMS(remainingSec));
  };

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

  const handleDisconnectWallet = () => {
    WalletAPI.disconnect();
    setWalletConnected(false);
    setWalletAddress(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setContent('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || !walletConnected || !walletAddress) {
      alert('Please connect your wallet and write some content!');
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (imageFile) {
        try {
          imageUrl = await CloudinaryAPI.uploadImage(imageFile, walletAddress);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          if (!confirm('Image upload failed. Continue without image?')) {
            setSubmitting(false);
            return;
          }
        }
      }
      // Use IQ6900_COMMUNITY_ID for submitting content
      await ContentAPI.submitContent(content, IQ6900_COMMUNITY_ID, imageUrl, walletAddress);
      resetForm();
      await loadContentAndCommunity(); // Reload content and community data
      alert('Content submitted successfully for IQ6900!');
    } catch (error) {
      console.error('Error submitting content for IQ6900:', error);
      alert('Failed to submit content. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Updated theme with a more dramatic, futuristic design inspired by the iq6900theme.png
  const theme = {
    // Updated text colors for more contrast and impact
    textNeon: 'text-lime-500',
    textHighlight: 'text-emerald-400',
    textLightNeutral: 'text-gray-200',
    textDarkForLightBg: 'text-gray-900',

    // Updated backgrounds for more depth and atmosphere
    bgBlack: 'bg-black',
    bgPanel: 'bg-gray-900/80',
    bgPanelDarker: 'bg-gray-950/90',
    bgInput: 'bg-gray-900/70',
    bgGradient: 'bg-gradient-to-br from-gray-900 via-green-950/20 to-gray-950',

    // Borders and accents with more glow effect
    borderNeon: 'border-lime-500',
    borderGlow: 'border-lime-500/50',
    borderDarkGreen: 'border-green-900',
    borderDarkGreenLighter: 'border-green-800/40',

    ringFocusNeon: 'focus:ring-lime-500',

    // Updated buttons for more futuristic feel
    buttonPrimaryBg: 'bg-lime-500 hover:bg-lime-400',
    buttonPrimaryText: 'text-black font-semibold',
    
    buttonSecondaryBg: 'bg-emerald-400/90 hover:bg-emerald-400', 
    buttonSecondaryText: 'text-gray-900 font-semibold',
    buttonSecondaryBorder: 'border-emerald-600/50',

    // Navigation and UI elements
    headerActiveLink: 'text-lime-500 font-bold',
    headerInactiveLink: 'text-gray-300 hover:text-lime-400 transition',

    // Stat boxes with more futuristic design
    statBoxBg: 'bg-gray-900/70',
    statBoxBorder: 'border-green-900/50',
    statBoxTextNeon: 'text-lime-500',
    statBoxLabel: 'text-gray-400',
    
    // Shadows for depth
    shadowGlow: 'shadow-lg shadow-lime-500/10',
    shadowBox: 'shadow-xl',
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme.bgBlack} ${theme.textLightNeutral} relative`}>
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/iq6900bg.jpg"
          alt="IQ6900 Background"
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-30"
        />
        <div className={`absolute inset-0 bg-gradient-to-br from-black/70 via-green-950/30 to-black/70`}></div>
      </div>

      {/* Header - Updated with more distinctive styling */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b ${theme.borderDarkGreenLighter}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/pulse_iq6900_logo.jpg" 
              alt="Pulse IQ6900 Logo" 
              width={120}
              height={40}
              className="cursor-pointer"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                <li><Link href="/" className={theme.headerInactiveLink}>Home</Link></li>
                <li><Link href="/soon" className={theme.headerInactiveLink}>Soon</Link></li>
                <li><Link href="/orca" className={theme.headerInactiveLink}>Orca</Link></li> 
                <li><Link href="/iq6900" className={theme.headerActiveLink}>IQ6900</Link></li> 
              </ul>
            </nav>
            <button
              onClick={walletConnected ? handleDisconnectWallet : handleConnectWallet}
              className={`px-4 py-2 rounded-lg ${theme.buttonPrimaryBg} ${theme.buttonPrimaryText} text-sm transition ${theme.shadowGlow}`}
            >
              {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Enhanced with more dramatic styling */}
      <section className="relative py-24 overflow-hidden z-10">
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 bg-gradient-to-br from-black/30 via-green-950/20 to-black/30`}></div> 
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${theme.textNeon} leading-tight`}>
                IQ6900 <span className={theme.textHighlight}>Community</span> Campaign
              </h1>
              <p className={`text-xl mb-8 ${theme.textLightNeutral} leading-relaxed`}>
                Join the IQ6900 community campaign! Post quality content, engage with the community, and earn rewards. The clock is ticking!
              </p>
              
              <div className={`${theme.bgGradient} backdrop-blur-md p-6 rounded-xl mb-8 border ${theme.borderGlow} ${theme.shadowBox}`}>
                <h3 className={`text-xl font-medium mb-4 ${theme.textNeon}`}>Reward Timer</h3>
                <div className="flex justify-center gap-4">
                  {['hours', 'minutes', 'seconds'].map((unit) => (
                    <div className="text-center" key={unit}>
                      <div className={`text-3xl font-bold ${theme.statBoxBg} rounded-lg w-16 h-16 flex items-center justify-center border ${theme.borderNeon} ${theme.statBoxTextNeon} ${theme.shadowGlow}`}>
                        {timeLeft[unit as keyof TimerState].toString().padStart(2, '0')}
                      </div>
                      <div className={`text-xs mt-2 ${theme.statBoxLabel}`}>{unit.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
                <p className={`text-sm text-center mt-3 ${theme.textLightNeutral}`}>
                  {community?.timeLimit ? `Time limit: ${community.timeLimit} minutes` : 'Default time limit: 120 minutes'}
                </p>
              </div>
            </div>

            <div className="md:w-1/2">
              <div className="relative">
                <div className={`relative ${theme.bgGradient} backdrop-blur-xl p-8 rounded-2xl border ${theme.borderGlow} ${theme.shadowBox} overflow-hidden`}>
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-lime-500/10 filter blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-emerald-500/10 filter blur-2xl"></div>
                  
                  <div className="flex items-center mb-6">
                    <div className={`relative w-16 h-16 mr-5 flex-shrink-0 ${theme.statBoxBg} rounded-xl flex items-center justify-center border ${theme.borderNeon} p-2 ${theme.shadowGlow}`}>
                      <Image 
                        src="/images/iq6900logo.jpg"
                        alt="IQ6900 Logo" 
                        width={48}
                        height={48}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-semibold ${theme.textNeon}`}>IQ6900 Community</h3>
                      <p className={`${theme.textHighlight} text-sm font-medium`}>Featured Project</p>
                    </div>
                  </div>
                  <p className={`${theme.textLightNeutral} mb-6 text-base`}>
                    IQ6900: Exploring the frontiers of decentralized intelligence. Join the movement!
                  </p>
                  
                  <div className={`flex justify-around items-center border-t border-b ${theme.borderDarkGreenLighter} py-4 mb-6 text-center`}>
                    <div>
                      <div className={`text-2xl font-bold ${theme.textNeon}`}>
                        {community?.bountyAmount ? parseFloat(community.bountyAmount).toFixed(2) : 'N/A'} PULSE
                      </div>
                      <div className={`text-xs ${theme.statBoxLabel} uppercase tracking-wider`}>BOUNTY</div>
                    </div>
                    <div className={`border-l ${theme.borderDarkGreenLighter} h-10`}></div>
                    <div>
                      <div className={`text-2xl font-bold ${theme.textNeon}`}>{posts.length}</div>
                      <div className={`text-xs ${theme.statBoxLabel} uppercase tracking-wider`}>Participants</div>
                    </div>
                  </div>

                  <a 
                    href="#" // Replace with actual IQ6900 project link
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 ${theme.buttonPrimaryBg} ${theme.buttonPrimaryText} text-center rounded-lg font-semibold text-sm transition duration-300 ${theme.shadowGlow}`}
                  >
                    Learn More About IQ6900
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Posting Section - Enhanced with more dramatic styling */}
      <section className={`py-20 relative z-10`}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-green-950/20 to-black/50"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="mb-14 text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${theme.textNeon} inline-block`}>
              Post About IQ6900
            </h2>
            {/* Updated underline with animation */}
            <div className={`h-1 w-40 bg-gradient-to-r from-lime-500 to-emerald-400 mx-auto rounded-full`}></div> 
          </div>
          
          <form onSubmit={handleSubmit} className="mb-12">
            <div className={`${theme.bgGradient} rounded-xl p-6 mb-4 border ${theme.borderGlow} ${theme.shadowBox}`}>
              <textarea
                className={`w-full ${theme.bgInput} border ${theme.borderDarkGreen} rounded-lg p-4 ${theme.textLightNeutral} resize-none focus:outline-none focus:ring-2 ${theme.ringFocusNeon}`}
                rows={4}
                placeholder="Share your thoughts about IQ6900..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={!walletConnected}
              />
              
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <label htmlFor="image-upload" 
                    className={`cursor-pointer px-4 py-2 rounded-lg ${theme.buttonSecondaryBg} ${theme.buttonSecondaryText} text-sm transition border ${theme.buttonSecondaryBorder} ${theme.shadowGlow}`}>
                    {imageFile ? 'Change Image' : 'Upload Image'}
                  </label>
                  <input 
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={!walletConnected}
                  />
                  {imageFile && <span className={`ml-3 text-sm ${theme.textLightNeutral}`}>{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    width={64} 
                    height={64} 
                    className={`rounded-lg object-cover border ${theme.borderNeon}`}
                  />
                )}
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={submitting || !walletConnected}
              className={`w-full py-3 mt-2 rounded-lg ${theme.buttonPrimaryBg} ${theme.buttonPrimaryText} font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${theme.shadowGlow}`}
            >
              {submitting ? 'Submitting...' : (walletConnected ? 'Submit Post' : 'Connect Wallet to Post')}
            </button>
            {!walletConnected && <p className={`text-center ${theme.textNeon} mt-2 text-sm`}>You must connect your wallet to post.</p>}
          </form>

          {/* Posts Feed - Enhanced for better visibility */}
          <div className="space-y-8">
            {loading && <p className={`text-center ${theme.textLightNeutral}`}>Loading posts...</p>}
            {!loading && posts.length === 0 && (
              <p className={`text-center ${theme.textLightNeutral}`}>No posts yet for IQ6900. Be the first!</p>
            )}
            {posts.map((post) => (
              <div key={post.id} className={`${theme.bgGradient} rounded-xl p-6 border ${theme.borderGlow} ${theme.shadowBox}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center ${theme.textNeon} font-semibold border ${theme.borderNeon} ${theme.shadowGlow}`}>
                      {post.walletAddress ? post.walletAddress.substring(2,4).toUpperCase() : '??'} 
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold ${theme.textNeon}`}>
                        {ContentAPI.formatWalletAddress(post.walletAddress)}
                      </span>
                      <span className={`text-xs ${theme.textLightNeutral}`}>
                        {ContentAPI.formatDate(post.createdAt)}
                      </span>
                    </div>
                    <p className={`${theme.textLightNeutral} whitespace-pre-wrap break-words`}>{post.content}</p>
                    {post.imageURL && (
                      <div className={`mt-3 rounded-lg overflow-hidden border ${theme.borderGlow}`}>
                        <Image 
                          src={post.imageURL} 
                          alt="User uploaded content" 
                          width={400} 
                          height={300} 
                          className="object-cover"
                          unoptimized 
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className={`flex gap-4 mt-4 border-t ${theme.borderDarkGreenLighter} pt-3`}>
                  <button className={`text-sm ${theme.headerInactiveLink} hover:${theme.textNeon}`}>Like</button>
                  <button className={`text-sm ${theme.headerInactiveLink} hover:${theme.textNeon}`}>Reply</button>
                  <button className={`text-sm ${theme.headerInactiveLink} hover:${theme.textNeon}`}>Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section - Enhanced with more dramatic styling */}
      <section id="rewards" className={`py-20 relative z-10`}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-green-950/30 to-black/50"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="mb-14 text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${theme.textNeon} inline-block`}>
              IQ6900 Campaign Rewards
            </h2>
            <div className={`h-1 w-40 bg-gradient-to-r from-lime-500 to-emerald-400 mx-auto rounded-full`}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className={`${theme.bgGradient} border ${theme.borderGlow} p-8 rounded-xl ${theme.shadowBox} transition duration-300`}>
              <h3 className={`text-2xl font-bold mb-6 ${theme.textNeon}`}>Winner Rewards</h3>
              <ul className="space-y-6">
                {[
                  { title: `${community?.bountyAmount ? parseFloat(community.bountyAmount).toFixed(2) : '100.00'} PULSE Tokens`, desc: "Awarded to the last poster" },
                  { title: "Exclusive IQ6900 NFT", desc: "A unique digital collectible for the winner" },
                  { title: "Priority Access", desc: "First access to future Pulse campaigns" },
                  { title: "Featured Profile", desc: "Highlighted profile on the Pulse platform" }
                ].map(reward => (
                  <li className="flex items-center" key={reward.title}>
                    <div className={`w-10 h-10 rounded-full ${theme.buttonPrimaryBg} flex items-center justify-center mr-4 ${theme.shadowGlow}`}>
                      <span className={`${theme.textDarkForLightBg} text-sm font-bold`}>✦</span>
                    </div>
                    <div>
                      <span className={`text-lg font-medium ${theme.textHighlight}`}>{reward.title}</span>
                      <p className={`text-sm ${theme.textLightNeutral}/80`}>{reward.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={`${theme.bgGradient} border ${theme.borderGlow} p-8 rounded-xl ${theme.shadowBox} transition duration-300`}>
              <h3 className={`text-2xl font-bold mb-6 ${theme.textNeon}`}>Active Participant Rewards</h3>
              <ul className="space-y-6">
                {[
                  { title: "PULSE Tokens per quality post", desc: "Earn as you contribute valuable content" },
                  { title: "IQ6900 Community Badges", desc: "Tiered badges based on contribution" },
                  { title: "Future Campaign Invites", desc: "Opportunity for exclusive campaigns" },
                  { title: "Early Access Features", desc: "Preview new Pulse platform features" }
                ].map(reward => (
                  <li className="flex items-center" key={reward.title}>
                    <div className={`w-10 h-10 rounded-full ${theme.buttonPrimaryBg} flex items-center justify-center mr-4 ${theme.shadowGlow}`}>
                      <span className={`${theme.textDarkForLightBg} text-sm font-bold`}>✦</span>
                    </div>
                    <div>
                      <span className={`text-lg font-medium ${theme.textHighlight}`}>{reward.title}</span>
                      <p className={`text-sm ${theme.textLightNeutral}/80`}>{reward.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className={`text-xl mb-8 ${theme.textHighlight}`}>Don't miss out on the IQ6900 campaign!</p>
            <a href="#top" 
              className={`px-8 py-3 ${theme.buttonPrimaryBg} ${theme.buttonPrimaryText} rounded-full font-bold text-lg inline-block transition-all duration-300 transform hover:scale-105 ${theme.shadowGlow}`}>
              Start Posting Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced with more consistent styling */}
      <footer className={`py-10 border-t ${theme.borderDarkGreenLighter} relative z-10`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Image
                src="/images/pulse_iq6900_logo.jpg" 
                alt="Pulse IQ6900 Logo" 
                width={100}
                height={30}
              />
              <p className={`mt-2 ${theme.textNeon}`}>Empowering decentralized intelligence</p>
            </div>
            <div className="flex space-x-6">
              {['Twitter', 'Discord', 'Medium', 'GitHub'].map(link => (
                <a href="#" key={link} className={`${theme.headerInactiveLink} hover:${theme.textNeon}`}>{link}</a>
              ))}
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t ${theme.borderDarkGreen} text-center ${theme.textLightNeutral}/70`}>
            <p>© {new Date().getFullYear()} Pulse x IQ6900. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}