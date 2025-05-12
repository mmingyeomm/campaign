'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CommunityAPI, Community } from '@/api/community';
import { ContentAPI, Content } from '@/api/content';
import { TimerAPI, TimerState } from '@/api/timer';
import { CONFIG } from '@/api/config';

const SOON_COMMUNITY_ID = CONFIG.fixed.communityId;
const ORCA_COMMUNITY_ID = "a485968a-751d-4545-9bbb-740d55875707";
const IQ6900_COMMUNITY_ID = "a8f3e6d1-7b92-4c5f-9e48-d67f0a2b3c4e";
const PULSE_COMMUNITY_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

export default function Home() {
  const [soonTimeLeft, setSoonTimeLeft] = useState<string>('00:00:00');
  const [soonCommunityData, setSoonCommunityData] = useState<Community | null>(null);
  const [soonPostsCount, setSoonPostsCount] = useState<number>(0);

  const [orcaTimeLeft, setOrcaTimeLeft] = useState<string>('00:00:00');
  const [orcaCommunityData, setOrcaCommunityData] = useState<Community | null>(null);
  const [orcaPostsCount, setOrcaPostsCount] = useState<number>(0);

  const [iq6900TimeLeft, setIq6900TimeLeft] = useState<string>('00:00:00');
  const [iq6900CommunityData, setIq6900CommunityData] = useState<Community | null>(null);
  const [iq6900PostsCount, setIq6900PostsCount] = useState<number>(0);

  const [pulseTimeLeft, setPulseTimeLeft] = useState<string>('00:00:00');
  const [pulseCommunityData, setPulseCommunityData] = useState<Community | null>(null);
  const [pulsePostsCount, setPulsePostsCount] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchSoonData = async () => {
      try {
        const community = await CommunityAPI.fetchCommunityById(SOON_COMMUNITY_ID);
        setSoonCommunityData(community);
        if (community) {
          const contents = await ContentAPI.fetchAllContents(SOON_COMMUNITY_ID);
          setSoonPostsCount(contents.length);
          const updateTimer = () => {
            const now = new Date();
            let remainingSec: number;
            const latestPost = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (latestPost && latestPost.createdAt) {
              const lastPostTime = new Date(latestPost.createdAt).getTime();
              remainingSec = Math.max(0, (community.timeLimit * 60) - Math.floor((now.getTime() - lastPostTime) / 1000));
            } else if (community.lastMessageTime) {
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
        }
      } catch (error) {
        console.error('Failed to fetch Soon community data for homepage:', error);
      }
    };
    fetchSoonData();
    return () => clearInterval(interval);
  }, []);

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
            const latestPost = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (latestPost && latestPost.createdAt) {
              const lastPostTime = new Date(latestPost.createdAt).getTime();
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
            const latestPost = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (latestPost && latestPost.createdAt) {
              const lastPostTime = new Date(latestPost.createdAt).getTime();
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchPulseData = async () => {
      try {
        const community = await CommunityAPI.fetchCommunityById(PULSE_COMMUNITY_ID);
        setPulseCommunityData(community);
        if (community) {
          const contents = await ContentAPI.fetchAllContents(PULSE_COMMUNITY_ID);
          setPulsePostsCount(contents.length);
          const updateTimer = () => {
            const now = new Date();
            let remainingSec: number;
            const latestPost = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (latestPost && latestPost.createdAt) {
              const lastPostTime = new Date(latestPost.createdAt).getTime();
              remainingSec = Math.max(0, (community.timeLimit * 60) - Math.floor((now.getTime() - lastPostTime) / 1000));
            } else if (community.lastMessageTime) {
                const elapsed = (now.getTime() - new Date(community.lastMessageTime).getTime()) / 1000;
                remainingSec = Math.max(0, community.timeLimit * 60 - Math.floor(elapsed));
            } else {
                remainingSec = community.timeLimit * 60;
            }
            const hms = TimerAPI.secondsToHMS(remainingSec);
            setPulseTimeLeft(TimerAPI.formatTime(hms));
          };
          updateTimer();
          interval = setInterval(updateTimer, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch Pulse community data for homepage:', error);
      }
    };
    fetchPulseData();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/pulseLogoBlank.png"
              alt="Pulse Logo"
              width={120}
              height={40}
              className="cursor-pointer"
            />
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="/" className="text-blue-400 font-bold">Home</Link></li>
              {/* <li><Link href="/pulse" className="hover:text-pink-400 transition">Pulse</Link></li> */}
              {/* <li><Link href="/soon" className="hover:text-blue-400 transition">Soon</Link></li> */}
              {/* <li><Link href="/orca" className="hover:text-blue-400 transition">Orca</Link></li> */}
              {/* <li><Link href="/iq6900" className="hover:text-blue-400 transition">IQ6900</Link></li> */}
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
            {/* Buttons moved to Round 3 Section */}
            {/* <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="#active-campaigns" // Changed href to scroll to section
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Join Pulse Campaign
              </Link>
              <Link 
                href="#how-it-works" 
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Learn More
              </Link>
            </div> */}
          </div>
        </div>
      </section>

      {/* Round 3 Coming Soon Section - Refined Styling */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          {/* 현대적인 Web3 스타일 이미지 프레임 */}
          <div className="flex-shrink-0 group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-pink-600/40 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 scale-105"></div>
            <div className="relative p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] transition-all duration-500">
              <div className="bg-gray-900/90 backdrop-blur-sm p-2 rounded-xl">
                <Image
                  src="/images/pulseround3.jpg"
                  alt="Pulse Round 3 Coming Soon"
                  width={600} 
                  height={338}
                  className="rounded-lg transform transition duration-500 group-hover:scale-[1.02]"
                  priority
                />
              </div>
            </div>
            {/* 선택적: 장식용 요소 추가 */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse delay-700"></div>
          </div>

          {/* 텍스트 콘텐츠 & 버튼 (기존 코드 유지) */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-transparent bg-clip-text">
              Round 3 is Coming Soon!
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Get ready for the next phase. More challenges, more rewards!
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link 
                href="#active-campaigns"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Join Pulse Campaign
              </Link>
              <Link 
                href="/round3"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:from-gray-700 hover:to-gray-800 backdrop-blur-sm font-medium border border-gray-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:border-purple-500/50"
              >
                What is Round 3?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section - Refined Card Styling */}
      <section id="active-campaigns" className="py-24 relative overflow-hidden">
        {/* Simplified background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/80 to-black opacity-80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              Active Campaigns
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Pulse Campaign Card - Simplified Styling & Hover */}
            {pulseCommunityData && (
              <div className="bg-gray-800/50 rounded-xl shadow-lg border border-gray-700 hover:border-pink-500/80 transition-all duration-300 overflow-hidden group transform hover:-translate-y-1 hover:shadow-pink-900/20 hover:shadow-xl">
                <div className="flex flex-col md:flex-row">
                  {/* Image container with subtle hover effect */}
                  <div className="md:w-1/3 relative h-40 md:h-auto flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-gray-900/80 overflow-hidden transition duration-300 group-hover:from-indigo-800/70">
                    <Image 
                      src="/images/pulselogo.jpg" 
                      alt="Pulse Logo" 
                      fill
                      style={{ objectFit: 'contain', padding: '1rem' }} 
                      className="transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="md:w-2/3 p-6 md:p-8"> {/* Adjusted padding */}
                    <div className="flex items-center mb-3"> {/* Reduced margin */}
                      <h3 className="text-2xl font-bold text-white">{pulseCommunityData?.name || 'Pulse Community'}</h3>
                      <span className="ml-3 px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-medium rounded-full border border-pink-500/30">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-300 mb-5 text-sm"> {/* Adjusted text size/margin */}
                      {pulseCommunityData?.description || 'Engage with the core Pulse community. Share your ideas, contributions, and help shape the future!'}
                    </p>
                    {/* Stats Grid - Simplified Styling */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"> {/* Reduced gap */}
                      <div className="bg-gray-900/60 p-3 rounded-lg text-center border border-gray-700/70">
                        <div className="text-xl font-bold text-pink-300">{pulsePostsCount > 0 ? pulsePostsCount : '0'}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Participants</div> {/* Updated text style */}
                      </div>
                      <div className="bg-gray-900/60 p-3 rounded-lg text-center border border-gray-700/70">
                        <div className="text-xl font-bold text-pink-300">{pulseCommunityData?.bountyAmount || '100'}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">PULSE Tokens</div>
                      </div>
                      <div className="bg-gray-900/60 p-3 rounded-lg text-center border border-gray-700/70">
                        <div className="text-xl font-bold text-pink-300">{pulseTimeLeft}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Time Left</div>
                      </div>
                      <div className="bg-gray-900/60 p-3 rounded-lg text-center border border-gray-700/70">
                        <div className="text-xl font-bold text-pink-300">{pulsePostsCount}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Posts</div>
                      </div>
                    </div>
                     {/* Buttons - Ensure consistent styling */}
                    <div className="flex flex-wrap gap-3">
                      <Link 
                        href="/pulse" 
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        Join Campaign
                      </Link>
                      <a 
                        href={pulseCommunityData?.imageURL || "#"}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-5 py-2 rounded-lg bg-gray-700/60 hover:bg-gray-600/80 text-sm font-medium border border-gray-600 text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        Learn About Pulse
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Commented out other campaigns - apply similar style refinements if re-enabled */}
            {/* {soonCommunityData && (...)} */}
            {/* {orcaCommunityData && (...)} */}
            {/* {iq6900CommunityData && (...)} */}

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
                  <span className="text-xl font-bold text-white">P</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-300">Join Our Current Campaign: Pulse Community</h3>
              </div>
              <p className="mb-6 text-gray-200">
                Participate in our Pulse community campaign and help boost content about the core platform. Share insights, feedback, and earn rewards.
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
                  <span className="text-gray-200">100 PULSE tokens reward</span>
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
                href="/pulse"
                className="block w-full py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-center rounded-lg font-bold transition duration-300 text-white"
              >
                Join the Campaign
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-900/70 to-blue-900/20 relative">
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
                src="/images/pulseLogoBlank.png"
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
