'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Play,
  Radio,
  Loader2,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  listBroadcasts,
  createBroadcast,
  getPublishUrl,
  getWatchUrl,
  getCommonApplications,
  Broadcast,
} from '@/lib/antMediaApi';

export default function StreamsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>('live');
  const [streams, setStreams] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStreamName, setNewStreamName] = useState('');

  // Load applications on mount
  useEffect(() => {
    const apps = getCommonApplications();
    setApplications(apps);
    if (apps.length > 0 && !selectedApp) {
      setSelectedApp(apps[0]);
    }
  }, []);

  // Load streams when application changes
  useEffect(() => {
    if (selectedApp) {
      loadStreams();
    }
  }, [selectedApp]);

  const loadStreams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listBroadcasts(selectedApp, 0, 100);
      setStreams(data);
      // Clear error on success
      setError(null);
    } catch (err: any) {
      console.error('Error loading streams:', err);
      const errorMessage = err.message || 'Failed to load streams';
      setError(errorMessage);
      
      // If it's a network error, provide helpful message
      if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
        setError(`${errorMessage}. Make sure Ant Media Server is running at ${process.env.NEXT_PUBLIC_AMS_URL || 'http://localhost:5080'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStream = async () => {
    if (!newStreamName.trim()) {
      setError('Please enter a stream name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const broadcast = await createBroadcast(newStreamName.trim(), selectedApp);
      const streamId = broadcast.streamId;

      // Redirect to publish page
      const publishUrl = getPublishUrl(streamId, selectedApp, newStreamName.trim());
      window.location.href = publishUrl;
    } catch (err: any) {
      console.error('Error creating stream:', err);
      setError(err.message || 'Failed to create stream');
      setIsCreating(false);
    }
  };

  const handleWatch = (streamId: string) => {
    const watchUrl = getWatchUrl(streamId, selectedApp, 'webrtc');
    router.push(`/watch?id=${streamId}&app=${selectedApp}&playOrder=webrtc`);
  };

  const handlePublish = (streamId: string, streamName?: string) => {
    // Redirect to Next.js publish wrapper page
    router.push(`/publish/${streamId}?app=${selectedApp}&name=${encodeURIComponent(streamName || '')}`);
  };

  const isStreamLive = (stream: Broadcast): boolean => {
    return stream.status === 'broadcasting' || stream.status === 'live' || stream.status === 'publishing';
  };

  const filteredStreams = streams.filter((stream) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      stream.name?.toLowerCase().includes(query) ||
      stream.streamId?.toLowerCase().includes(query) ||
      stream.status?.toLowerCase().includes(query)
    );
  });

  const liveStreams = filteredStreams.filter(isStreamLive);
  const offlineStreams = filteredStreams.filter((s) => !isStreamLive(s));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Streams Management</h1>
              <p className="text-gray-400">Manage and monitor your live streams</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Back
            </motion.button>
          </div>

          {/* Application Selector */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium text-gray-300">Application:</label>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {applications.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadStreams}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Create Stream
            </motion.button>
          </div>

          {/* Create Stream Form */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700"
              >
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newStreamName}
                    onChange={(e) => setNewStreamName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isCreating && newStreamName.trim()) {
                        handleCreateStream();
                      }
                    }}
                    placeholder="Enter stream name"
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isCreating}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateStream}
                    disabled={isCreating || !newStreamName.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create & Publish
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search streams by name, ID, or status..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1">Error Loading Streams</p>
                <p>{error}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-blue-500" />
          </div>
        )}

        {/* Streams List */}
        {!isLoading && (
          <div className="space-y-6">
            {/* Live Streams */}
            {liveStreams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Radio size={24} className="text-red-500 animate-pulse" />
                  <h2 className="text-2xl font-bold text-white">Live Streams ({liveStreams.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveStreams.map((stream) => (
                    <motion.div
                      key={stream.streamId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1 truncate">{stream.name || stream.streamId}</h3>
                          <p className="text-xs text-gray-400 font-mono truncate">{stream.streamId}</p>
                        </div>
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                          <Radio size={12} className="animate-pulse" />
                          LIVE
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleWatch(stream.streamId)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          Watch
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Offline Streams */}
            {offlineStreams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Video size={24} className="text-gray-400" />
                  <h2 className="text-2xl font-bold text-white">Offline Streams ({offlineStreams.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offlineStreams.map((stream) => (
                    <motion.div
                      key={stream.streamId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1 truncate">{stream.name || stream.streamId}</h3>
                          <p className="text-xs text-gray-400 font-mono truncate">{stream.streamId}</p>
                        </div>
                        <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                          {stream.status || 'OFFLINE'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePublish(stream.streamId, stream.name)}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Video size={16} />
                          Publish
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleWatch(stream.streamId)}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <EyeOff size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {filteredStreams.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Video size={64} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No streams found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'Try a different search query' : 'Create your first stream to get started'}
                </p>
                {!searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus size={20} />
                    Create Stream
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

