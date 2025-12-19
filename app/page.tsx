'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Video, Loader2 } from 'lucide-react';
import { createBroadcast, getPublishUrl } from '@/lib/antMediaApi';

export default function HomePage() {
  const router = useRouter();
  const [appName, setAppName] = useState('live');
  const [streamName, setStreamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartLiveStream = async () => {
    // Validation
    if (!streamName.trim()) {
      setError('Please enter a stream name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create broadcast using Ant Media API with user-provided stream name
      const broadcast = await createBroadcast(streamName.trim(), appName);

      // Extract streamId
      const streamId = broadcast.streamId;

      // Redirect to Next.js publish wrapper page (which embeds Ant Media publish page)
      // This allows us to add a watch button after publishing starts
      router.push(`/publish/${streamId}?app=${appName}&name=${encodeURIComponent(streamName.trim())}`);
    } catch (err: any) {
      console.error('Error starting live stream:', err);
      setError(err.message || 'Failed to start live stream. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <Video size={40} className="text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Live Stream</h1>
          <p className="text-gray-400">Start your live streaming session</p>
        </div>

        {/* Application Name Input */}
        <div className="mb-4">
          <label htmlFor="appName" className="block text-sm font-medium text-gray-300 mb-2">
            Application Name
          </label>
          <motion.input
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            type="text"
            id="appName"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="live"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Stream Name Input */}
        <div className="mb-6">
          <label htmlFor="streamName" className="block text-sm font-medium text-gray-300 mb-2">
            Stream Name <span className="text-red-400">*</span>
          </label>
          <motion.input
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            type="text"
            id="streamName"
            value={streamName}
            onChange={(e) => setStreamName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading && streamName.trim()) {
                handleStartLiveStream();
              }
            }}
            placeholder="Enter your stream name"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
            required
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartLiveStream}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/50 transition-all duration-200 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Starting...</span>
            </>
          ) : (
            <>
              <Video size={20} />
              <span>Start Live Stream</span>
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

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-col gap-3"
        >
          <button
            onClick={() => router.push('/streams')}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Video size={18} />
            Manage Streams
          </button>
          <button
            onClick={() => router.push('/watch')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Watch Existing Stream →
          </button>
        </motion.div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Ant Media Server</p>
        </div>
      </motion.div>
    </div>
  );
}

