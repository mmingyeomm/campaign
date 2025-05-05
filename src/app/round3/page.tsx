'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Round3Page() {
  // Timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  
  // Post content state
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([
    { 
      id: 1, 
      user: 'whale_watcher', 
      content: 'Just discovered Orca - amazing interface for swaps!', 
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      avatar: '/images/round3.jpg'
    },
    { 
      id: 2, 
      user: 'crypto_pioneer', 
      content: 'Orca\'s concentrated liquidity pools are game-changing for DeFi traders looking for better execution prices.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      avatar: '/images/round3.jpg'
    }
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Timer reached zero
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle post submission
  const handleSubmit = (e : any) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      const newPost = {
        id: posts.length + 1,
        user: 'you',
        content,
        timestamp: new Date().toISOString(),
        avatar: '/images/round3.jpg'
      };
      
      setPosts([newPost, ...posts]);
      setContent('');
      
      // Reset timer when new content is posted
      setTimeLeft({ hours: 23, minutes: 59, seconds: 59 });
      setSubmitting(false);
    }, 1000);
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
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="/" className="hover:text-blue-400 transition">Home</Link></li>
              <li><Link href="/soon" className="hover:text-blue-400 transition">Soon</Link></li>
              <li><Link href="/round3" className="text-blue-400 font-bold">Round 3</Link></li>
              <li><Link href="#rewards" className="hover:text-blue-400 transition">Rewards</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background.png"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
                Pulse Round 3: Orca Community
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Join our community bootstrapper campaign and earn rewards by posting quality content about Orca. The clock is ticking!
              </p>
              
              {/* Timer Display */}
              <div className="bg-gray-900/80 backdrop-blur-md p-6 rounded-xl mb-8 border border-blue-500/30">
                <h3 className="text-xl font-medium mb-4">Reward Timer</h3>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-gray-400">HOURS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-gray-400">MINUTES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gray-800 rounded-lg w-16 h-16 flex items-center justify-center">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-gray-400">SECONDS</div>
                  </div>
                </div>
                <p className="text-sm mt-4 text-center text-gray-300">
                  Last poster when timer expires wins the round's rewards!
                </p>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative">
                <Image
                  src="/images/orca.png"
                  alt="Orca"
                  width={500}
                  height={500}
                  className="rounded-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-bold">
                  Featured Community
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Content Posting Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Post About <span className="text-blue-400">Orca</span>
          </h2>
          
          {/* Post Form */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="bg-gray-800 rounded-xl p-6 mb-4">
              <textarea
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Share your thoughts about Orca..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-400">
                  Quality content increases your chances of winning
                </p>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    submitting || !content.trim()
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
            <h3 className="text-xl font-bold mb-6">Recent Community Posts</h3>
            
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={post.avatar}
                      alt={post.user}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{post.user}</h4>
                    <p className="text-xs text-gray-400">
                      {new Date(post.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-200">{post.content}</p>
                <div className="flex gap-4 mt-4">
                  <button className="text-gray-400 text-sm hover:text-blue-400">Like</button>
                  <button className="text-gray-400 text-sm hover:text-blue-400">Reply</button>
                  <button className="text-gray-400 text-sm hover:text-blue-400">Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
            Pulse Round 3 Rewards
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-xl hover:border-blue-500/50 transition duration-300">
              <h3 className="text-2xl font-bold mb-6 text-blue-400">Winner Rewards</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2 text-xl">✦</span>
                  <span className="text-lg">500 PULSE Tokens</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2 text-xl">✦</span>
                  <span className="text-lg">Exclusive NFT Badge</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2 text-xl">✦</span>
                  <span className="text-lg">Priority access to future rounds</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2 text-xl">✦</span>
                  <span className="text-lg">Featured profile on Pulse platform</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 p-8 rounded-xl hover:border-blue-500/50 transition duration-300">
              <h3 className="text-2xl font-bold mb-6 text-blue-400">Active Participant Rewards</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2 text-xl">✦</span>
                  <span className="text-lg">50 PULSE Tokens per quality post</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2 text-xl">✦</span>
                  <span className="text-lg">Community badges based on contribution level</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2 text-xl">✦</span>
                  <span className="text-lg">Opportunity to be selected for future campaigns</span>
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2 text-xl">✦</span>
                  <span className="text-lg">Early access to Pulse platform features</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-xl mb-8">Don't miss your chance to participate in this exciting round!</p>
            <Link href="#top" className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full font-bold text-lg inline-block transition-all duration-300 transform hover:scale-105">
              Start Posting Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Image
                src="/images/logo.png"
                alt="Pulse Logo"
                width={100}
                height={30}
              />
              <p className="mt-2 text-gray-400">Empowering communities through engagement</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Discord</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">Medium</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">GitHub</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Pulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 