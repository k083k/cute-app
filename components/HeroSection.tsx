'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, HeartIcon, StarIcon } from '@heroicons/react/24/solid';

export default function HeroSection() {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    // Fetch authenticated user's name
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      if (data.isAuthenticated && data.user) {
        setUserName(data.user.name);
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  if (!mounted) {
    return null;
  }

  const floatingIcons = [
    { Icon: SparklesIcon, delay: 0, duration: 3, x: 20, y: 30 },
    { Icon: HeartIcon, delay: 0.5, duration: 4, x: -30, y: 20 },
    { Icon: StarIcon, delay: 1, duration: 3.5, x: 40, y: -20 },
  ];

  return (
    <div className="relative overflow-hidden mb-12">
      {/* Floating decorative icons */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingIcons.map(({ Icon, delay, duration, x, y }, index) => (
          <motion.div
            key={index}
            className="absolute opacity-20"
            style={{
              left: `${20 + index * 30}%`,
              top: `${30 + index * 10}%`,
            }}
            animate={{
              y: [0, y, 0],
              x: [0, x, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Icon className="w-12 h-12 text-slate-300" />
          </motion.div>
        ))}
      </div>

      {/* Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center py-16 px-4"
      >
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4"
        >
          <span className="inline-block px-6 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-700 shadow-sm border border-slate-200">
            {greeting}{userName ? `, ${userName}` : ''}
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-slate-900"
        >
          You're Doing Amazing
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Every step you take in law school is building the incredible lawyer you're meant to be.
          Here's your daily dose of encouragement and inspiration.
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="h-1 w-32 mx-auto bg-slate-300 rounded-full"
        />
      </motion.div>

      {/* Bottom wave decoration */}
      <div className="absolute -bottom-1 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-16 md:h-20"
        >
          <path
            d="M0,0 C150,80 350,80 600,50 C850,20 1050,20 1200,80 L1200,120 L0,120 Z"
            className="fill-slate-100 opacity-30"
          />
          <path
            d="M0,20 C200,60 400,60 600,40 C800,20 1000,20 1200,60 L1200,120 L0,120 Z"
            className="fill-slate-50 opacity-20"
          />
        </svg>
      </div>
    </div>
  );
}
