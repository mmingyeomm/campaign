'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CommunityAPI, Community } from '@/api/community';
import { ContentAPI } from '@/api/content';
import { TimerAPI } from '@/api/timer';
import { CONFIG } from '@/api/config';

const IQ6900_COMMUNITY_ID = "a8f3e6d1-7b92-4c5f-9e48-d67f0a2b3c4e";

export default function Home() {
  const [soonTimeLeft, setSoonTimeLeft] = useState<string>('00:00:00');
  const [orcaTimeLeft, setOrcaTimeLeft] = useState<string>('00:00:00');
  const [orcaCommunityData, setOrcaCommunityData] = useState<Community | null>(null);
  const [orcaPostsCount, setOrcaPostsCount] = useState<number>(0);

  const [iq6900TimeLeft, setIq6900TimeLeft] = useState<string>('00:00:00');
  const [iq6900CommunityData, setIq6900CommunityData] = useState<Community | null>(null);
  const [iq6900PostsCount, setIq6900PostsCount] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    CommunityAPI.fetchCommunityById(CONFIG.fixed.communityId)
      .then(community => {
        if (!community) return;
        const updateTimer = () => {
          const now = new Date();
          let remainingSec: number;
          if (community.lastMessageTime) {
            const elapsed = (now.getTime() - new Date(community.lastMessageTime).getTime()) / 1000;
            remainingSec = Math.max(0, community.timeLimit * 60 - Math.floor(elapsed));
          } else {
            remainingSec = community.timeLimit * 60;
          }
          const hms = TimerAPI.secondsToHMS(remainingSec);
          setSoonTimeLeft(TimerAPI.formatTime(hms));
        };
        updateTimer();
        interval = setInterval(updateTimer, 1000);
      })
      .catch(console.error);
    return () => clearInterval(interval);
  }, []);

  const ORCA_COMMUNITY_ID = "a485968a-751d-4545-9bbb-740d55875707";
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchOrcaData = async () => {
      try {
        const community = await CommunityAPI.fetchCommunityById(ORCA_COMMUNITY_ID);
        setOrcaCommunityData(community);
        if (community) {
          const contents = await ContentAPI.fetchAllContents(ORCA_COMMUNITY_ID);
          setOrcaPostsCount(contents.length);
          const updateTimer = () => {
            const now = new Date();
            let remainingSec: number;
            if (contents.length > 0 && contents[0].createdAt) {
              const lastPostTime = new Date(contents[0].createdAt).getTime();
              remainingSec = Math.max(0, (community.timeLimit * 60) - Math.floor((now.getTime() - lastPostTime) / 1000));
            } else if (community.lastMessageTime) {
                const elapsed = (now.getTime() - new Date(community.lastMessageTime).getTime()) / 1000;
                remainingSec = Math.max(0, community.timeLimit * 60 - Math.floor(elapsed));
            } else {
                remainingSec = community.timeLimit * 60;
            }
            const hms = TimerAPI.secondsToHMS(remainingSec);
            setOrcaTimeLeft(TimerAPI.formatTime(hms));
          };
          updateTimer();
          interval = setInterval(updateTimer, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch Orca community data for homepage:', error);
      }
    };
    fetchOrcaData();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchIQ6900Data = async () => {
      try {
        const community = await CommunityAPI.fetchCommunityById(IQ6900_COMMUNITY_ID);
        setIq6900CommunityData(community);
        if (community) {
          const contents = await ContentAPI.fetchAllContents(IQ6900_COMMUNITY_ID);
          setIq6900PostsCount(contents.length);
          const updateTimer = () => {
            const now = new Date();
            let remainingSec: number;
            if (contents.length > 0 && contents[0].createdAt) {
              const lastPostTime = new Date(contents[0].createdAt).getTime();
              remainingSec = Math.max(0, (community.timeLimit * 60) - Math.floor((now.getTime() - lastPostTime) / 1000));
            } else if (community.lastMessageTime) {
                const elapsed = (now.getTime() - new Date(community.lastMessageTime).getTime()) / 1000;
                remainingSec = Math.max(0, community.timeLimit * 60 - Math.floor(elapsed));
            } else {
                remainingSec = community.timeLimit * 60;
            }
            const hms = TimerAPI.secondsToHMS(remainingSec);
            setIq6900TimeLeft(TimerAPI.formatTime(hms));
          };
          updateTimer();
          interval = setInterval(updateTimer, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch IQ6900 community data for homepage:', error);
      }
    };
    fetchIQ6900Data();
    return () => clearInterval(interval);
  }, []);

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
              <li><Link href="/" className="text-blue-400 font-bold">Home</Link></li>
              <li><Link href="/soon" className="hover:text-blue-400 transition">Soon</Link></li>
              <li><Link href="/orca" className="hover:text-blue-400 transition">Orca</Link></li>
              <li><Link href="/iq6900" className="hover:text-blue-400 transition">IQ6900</Link></li>
              <li><Link href="#about" className="hover:text-blue-400 transition">About</Link></li>
            </ul>
          </nav>
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
              Pulse Community Bootstrapper
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-300">
              Participate in community bootstrapping campaigns and earn rewards by posting quality content about your favorite projects.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/soon" 
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Join Soon Campaign
              </Link>
              <Link 
                href="#how-it-works" 
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/background.png')] opacity-5 bg-fixed"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              Active Campaign
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl shadow-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative h-40 md:h-auto flex items-center justify-center bg-gradient-to-r from-blue-900/40 to-purple-900/40">
                  <Image 
                    src="/images/soonlogo.png" 
                    alt="Soon Logo" 
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">Soon Community</h3>
                    <span className="ml-3 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-200 mb-6">
                    Soon is an innovative platform designed to revolutionize community interactions. Join our campaign to help promote this cutting-edge project and earn rewards for quality content contributions.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-900/40 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-300">23</div>
                      <div className="text-xs text-gray-300">Participants</div>
                    </div>
                    <div className="bg-blue-900/40 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-300">500</div>
                      <div className="text-xs text-gray-300">PULSE Tokens</div>
                    </div>
                    <div className="bg-blue-900/40 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-300">{soonTimeLeft}</div>
                      <div className="text-xs text-gray-300">Time Left</div>
                    </div>
                    <div className="bg-blue-900/40 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-300">85</div>
                      <div className="text-xs text-gray-300">Posts</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      href="/soon" 
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm font-medium transition-all duration-300"
                    >
                      Join Campaign
                    </Link>
                    <a 
                      href="https://soon.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/50 text-sm font-medium border border-blue-500/30 transition-all duration-300"
                    >
                      Learn About Soon
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Orca Community Card - Teal Theme */}
            <div className="mt-12 bg-gradient-to-br from-teal-900/30 to-teal-800/30 rounded-xl shadow-xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative h-40 md:h-auto flex items-center justify-center bg-gradient-to-r from-teal-900/40 to-teal-800/40">
                  <Image 
                    src="/images/orca.png" 
                    alt="Orca Logo" 
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center mb-4">
                    <h3 className="text-2xl font-bold text-white">{orcaCommunityData?.name || 'Orca Community'}</h3>
                    <span className="ml-3 px-3 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full border border-teal-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-200 mb-6">
                    {orcaCommunityData?.description || 'Orca is a leading AMM on Solana, known for its user-friendly interface and capital efficiency. Join our campaign to support Orca and earn rewards!'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-teal-900/40 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-teal-300">{orcaPostsCount > 0 ? orcaPostsCount : '20+'}</div>
                      <div className="text-xs text-gray-300">Participants</div>
                    </div>
                    <div className="bg-teal-900/40 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-teal-300">{orcaCommunityData?.bountyAmount || '500'}</div>
                      <div className="text-xs text-gray-300">PULSE Tokens</div>
                    </div>
                    <div className="bg-teal-900/40 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-teal-300">{orcaTimeLeft}</div>
                      <div className="text-xs text-gray-300">Time Left</div>
                    </div>
                    <div className="bg-teal-900/40 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-teal-300">{orcaPostsCount}</div>
                      <div className="text-xs text-gray-300">Posts</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      href="/orca" 
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-sm font-medium transition-all duration-300"
                    >
                      Join Campaign
                    </Link>
                    <a 
                      href={orcaCommunityData?.imageURL || "https://solana.com/ecosystem/orca"}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2 rounded-lg bg-teal-900/40 hover:bg-teal-800/50 text-sm font-medium border border-teal-500/30 transition-all duration-300"
                    >
                      Learn About Orca
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* IQ6900 Community Card - Neon Green/Black Theme */}
            <div className="mt-12 bg-gray-900/70 rounded-xl shadow-xl border border-green-700/50 hover:border-lime-400/70 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative h-40 md:h-auto flex items-center justify-center bg-black/50">
                  <Image 
                    src="/images/iq6900logo.jpg" 
                    alt="IQ6900 Logo" 
                    fill 
                    style={{ objectFit: 'contain', padding: '1rem' }} 
                  />
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center mb-4">
                    <h3 className="text-2xl font-bold text-lime-400">{iq6900CommunityData?.name || 'IQ6900 Community'}</h3>
                    <span className="ml-3 px-3 py-1 bg-green-700/30 text-lime-300 text-xs rounded-full border border-green-600/50">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-300 mb-6">
                    {iq6900CommunityData?.description || 'IQ6900: Exploring the frontiers of decentralized intelligence. Join the campaign!'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800/60 p-3 rounded-lg text-center border border-green-800/50">
                      <div className="text-xl font-bold text-lime-400">{iq6900PostsCount > 0 ? iq6900PostsCount : '0'}</div>
                      <div className="text-xs text-gray-400">Participants</div>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-lg text-center border border-green-800/50">
                      <div className="text-xl font-bold text-lime-400">{iq6900CommunityData?.bountyAmount || '100'}</div>
                      <div className="text-xs text-gray-400">PULSE Tokens</div>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-lg text-center border border-green-800/50">
                      <div className="text-xl font-bold text-lime-400">{iq6900TimeLeft}</div>
                      <div className="text-xs text-gray-400">Time Left</div>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-lg text-center border border-green-800/50">
                      <div className="text-xl font-bold text-lime-400">{iq6900PostsCount}</div>
                      <div className="text-xs text-gray-400">Posts</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      href="/iq6900" 
                      className="px-5 py-2 rounded-lg bg-lime-400 hover:bg-lime-500 text-black text-sm font-semibold transition-all duration-300"
                    >
                      Join Campaign
                    </Link>
                    <a 
                      href="#"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-5 py-2 rounded-lg bg-emerald-300 hover:bg-emerald-400 text-green-900 text-sm font-semibold border border-green-700/80 transition-all duration-300"
                    >
                      Learn About IQ6900
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-900/70">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              What is Pulse?
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-blue-300">Community Bootstrapper Platform</h3>
              <p className="text-lg mb-6 text-gray-200">
                Pulse is a revolutionary platform designed to help communities grow through active engagement and participation. We create a dynamic environment where contributors are rewarded and communities thrive.
              </p>
              <p className="text-lg mb-6 text-gray-200">
                Through our innovative time clock system, we keep communities engaged and content fresh. The last contributor when the clock expires wins substantial rewards.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 text-xl">✦</span>
                  <span className="text-gray-200">Support for multiple community campaigns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 text-xl">✦</span>
                  <span className="text-gray-200">Fair and transparent reward distribution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 text-xl">✦</span>
                  <span className="text-gray-200">Quality content is valued and promoted</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl p-6 border border-blue-500/30 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                  <span className="text-xl font-bold text-white">S</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-300">Join Our Current Campaign: Soon Community</h3>
              </div>
              <p className="mb-6 text-gray-200">
                Participate in our Soon community campaign and help boost content about this innovative project. Share insights, tutorials, updates, and earn rewards.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-200">24-hour countdown timer</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-200">500 PULSE tokens reward</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-200">Exclusive NFT for winners</span>
                </li>
              </ul>
              <Link
                href="/soon"
                className="block w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-center rounded-lg font-bold transition duration-300"
              >
                Join the Campaign
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-900/70 to-blue-900/20 relative">
        <div className="absolute inset-0 bg-[url('/images/background.png')] opacity-5 bg-fixed"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              How Pulse Works
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8 rounded-xl transition-all duration-300 hover:transform hover:translate-y-[-5px] border border-blue-500/20 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-md">1</div>
              <h3 className="text-xl font-bold mb-4 text-blue-300">Join a Campaign</h3>
              <p className="text-gray-200">
                Browse our active community campaigns and join the ones that interest you the most. Each campaign focuses on a specific community or project.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8 rounded-xl transition-all duration-300 hover:transform hover:translate-y-[-5px] border border-blue-500/20 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-md">2</div>
              <h3 className="text-xl font-bold mb-4 text-blue-300">Post Quality Content</h3>
              <p className="text-gray-200">
                Contribute valuable content about the campaign topic. Share insights, updates, educational material, or engaging discussions.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 p-8 rounded-xl transition-all duration-300 hover:transform hover:translate-y-[-5px] border border-blue-500/20 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-md">3</div>
              <h3 className="text-xl font-bold mb-4 text-blue-300">Earn Rewards</h3>
              <p className="text-gray-200">
                Each post extends the campaign timer. When the timer runs out, the last contributor wins the campaign rewards. All active participants earn points.
              </p>
            </div>
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
