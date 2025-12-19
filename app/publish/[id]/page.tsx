'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ExternalLink, ArrowLeft, Copy, Check } from 'lucide-react';
import { getPublishUrl, getWatchUrl } from '@/lib/antMediaApi';

export default function PublishPage() {
  const params = useParams();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const streamId = params.id as string;
  
  const [appName, setAppName] = useState('live');
  const [streamName, setStreamName] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [watchUrl, setWatchUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showWatchButton, setShowWatchButton] = useState(false);

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const app = urlParams.get('app') || 'live';
    const name = urlParams.get('name') || '';
    
    setAppName(app);
    setStreamName(name);
    
    // Generate watch URL
    if (streamId) {
      const watch = getWatchUrl(streamId, app, 'webrtc');
      setWatchUrl(watch);
    }
  }, [streamId]);

  // Show watch button immediately (user can watch stream once publishing starts)
  useEffect(() => {
    if (streamId && watchUrl) {
      // Show button immediately so user can watch once stream is live
      setShowWatchButton(true);
    }
  }, [streamId, watchUrl]);

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

  const handleWatch = () => {
    if (watchUrl) {
      // Open in new tab to avoid stopping the publish stream
      window.open(`/watch?id=${streamId}&app=${appName}&playOrder=webrtc`, '_blank');
    }
  };

  const publishUrl = streamId ? getPublishUrl(streamId, appName, streamName) : '';

  return (
    <div className="min-h-screen bg-black">
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

          <div className="flex items-center gap-4">
            {streamName && (
              <h1 className="text-xl font-semibold text-white">{streamName}</h1>
            )}
            {isPublishing && (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>

          <div className="w-24" /> {/* Spacer */}
        </div>
      </div>

      {/* Publish Iframe */}
      <div className="pt-16 h-screen">
        <iframe
          ref={iframeRef}
          src={publishUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; display-capture"
          allowFullScreen
          title="Publish Stream"
        />
      </div>

      {/* Floating Watch Button - Always visible */}
      {showWatchButton && watchUrl && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 z-50 flex flex-col gap-3"
        >
          {/* Watch URL Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/95 backdrop-blur-md rounded-lg p-4 border border-gray-700 shadow-2xl max-w-md"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Watch Your Stream</p>
              {isPublishing && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={watchUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-xs font-mono truncate"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                title="Copy URL"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWatch}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={20} />
              {isPublishing ? 'Watch Live Stream' : 'Watch Stream'}
              <ExternalLink size={16} />
            </motion.button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {isPublishing ? 'Stream is live!' : 'Click after starting to publish'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

