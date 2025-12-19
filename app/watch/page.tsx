'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Loader2, Copy, Check } from 'lucide-react';
import { getWatchUrl } from '@/lib/antMediaApi';

export default function WatchPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [appName, setAppName] = useState('live');
  const [streamId, setStreamId] = useState('');
  const [playOrder, setPlayOrder] = useState<'webrtc' | 'hls'>('webrtc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchUrl, setWatchUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleWatch = () => {
    if (!streamId.trim()) {
      setError('Please enter a stream ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Clean stream ID - extract just the ID if it's a URL
    let cleanStreamId = streamId.trim();
    
    // If it's a full URL, extract just the ID
    if (cleanStreamId.includes('http://') || cleanStreamId.includes('https://')) {
      try {
        const url = new URL(cleanStreamId);
        const urlParams = new URLSearchParams(url.search);
        cleanStreamId = urlParams.get('id') || cleanStreamId.split('id=')[1]?.split('&')[0] || cleanStreamId;
      } catch (e) {
        // If URL parsing fails, try to extract ID manually
        const match = cleanStreamId.match(/[?&]id=([^&]+)/);
        if (match) {
          cleanStreamId = match[1];
        }
      }
    }
    
    // Remove any trailing parameters
    cleanStreamId = cleanStreamId.split('&')[0].split('?')[0].trim();
    
    if (!cleanStreamId) {
      setError('Invalid stream ID');
      setIsLoading(false);
      return;
    }

    // Update stream ID in state
    setStreamId(cleanStreamId);

    // Generate watch URL with clean stream ID
    const url = getWatchUrl(cleanStreamId, appName, playOrder);
    setWatchUrl(url);
    setIsLoading(false);
  };

  const handleCopyUrl = async () => {
    if (watchUrl) {
      try {
        await navigator.clipboard.writeText(watchUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Handle URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');
    const app = params.get('app');
    const order = params.get('playOrder') as 'webrtc' | 'hls' | null;

    // Extract stream ID if it's a full URL
    if (id) {
      // Check if id is a full URL and extract just the stream ID
      if (id.includes('http://') || id.includes('https://')) {
        // Try to extract ID from URL
        try {
          const url = new URL(id);
          const urlParams = new URLSearchParams(url.search);
          id = urlParams.get('id') || id.split('id=')[1]?.split('&')[0] || id;
        } catch (e) {
          // If URL parsing fails, try to extract ID manually
          const match = id.match(/[?&]id=([^&]+)/);
          if (match) {
            id = match[1];
          }
        }
      }
      
      // Clean up the ID (remove any trailing parameters)
      if (id) {
        id = id.split('&')[0].split('?')[0];
        setStreamId(id);
        
        if (app) setAppName(app);
        if (order && (order === 'webrtc' || order === 'hls')) {
          setPlayOrder(order);
        }
        
        // Auto-load if ID is provided
        if (id) {
          const finalId = id; // Store in const to ensure it's not null
          setTimeout(() => {
            const url = getWatchUrl(finalId, app || 'live', order || 'webrtc');
            setWatchUrl(url);
          }, 100);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </motion.button>

          <h1 className="text-xl font-semibold text-white">Watch Live Stream</h1>

          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="pt-20 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Input Section */}
          {!watchUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Application Name */}
                <div>
                  <label htmlFor="watchAppName" className="block text-sm font-medium text-gray-300 mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    id="watchAppName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="live"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                </div>

                {/* Stream ID */}
                <div>
                  <label htmlFor="watchStreamId" className="block text-sm font-medium text-gray-300 mb-2">
                    Stream ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="watchStreamId"
                    value={streamId}
                    onChange={(e) => setStreamId(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isLoading && streamId.trim()) {
                        handleWatch();
                      }
                    }}
                    placeholder="Enter stream ID"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Play Order */}
                <div>
                  <label htmlFor="playOrder" className="block text-sm font-medium text-gray-300 mb-2">
                    Play Order
                  </label>
                  <select
                    id="playOrder"
                    value={playOrder}
                    onChange={(e) => setPlayOrder(e.target.value as 'webrtc' | 'hls')}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  >
                    <option value="webrtc">WebRTC</option>
                    <option value="hls">HLS</option>
                  </select>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWatch}
                disabled={isLoading || !streamId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-blue-500/50 transition-all duration-200 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Watch Stream</span>
                  </>
                )}
              </motion.button>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Video Player Section */}
          {watchUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 shadow-2xl"
            >
              {/* URL Display Bar */}
              <div className="bg-gray-900/80 p-4 border-b border-gray-700 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Stream URL</p>
                  <p className="text-sm text-gray-300 truncate font-mono">{watchUrl}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setWatchUrl(null);
                    setStreamId('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                >
                  Change Stream
                </motion.button>
              </div>

              {/* Iframe Player */}
              <div className="relative aspect-video bg-black">
                <iframe
                  ref={iframeRef}
                  src={watchUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; camera; microphone; display-capture"
                  allowFullScreen
                  title="Live Stream Player"
                />
              </div>
            </motion.div>
          )}

          {/* Info Section */}
          {!watchUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center text-gray-400 text-sm"
            >
              <p>Enter a stream ID to watch the live stream</p>
              <p className="mt-2 text-xs text-gray-500">
                The stream will play automatically when available
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

