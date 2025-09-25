// components/ChangelogModal.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import changelogData from '@/data/changelog.json';

// Limiting to 10 entries initially
const INITIAL_ENTRIES_LIMIT = 10;

interface ChangelogModalProps {
  currentVersion: string;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ currentVersion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const displayedLogs = showAll 
    ? changelogData 
    : changelogData.slice(0, INITIAL_ENTRIES_LIMIT);

  return (
    <>
      {/* Changelog button Top Right Corner */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="text-sm px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition font-medium shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Changelog v{currentVersion} 📄
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-3xl font-bold mb-6 text-blue-400">Version History</h3>

              <div className="space-y-6">
                {displayedLogs.map((log, index) => (
                  <motion.div 
                    key={log.version} 
                    className="border-b border-gray-700 pb-4 last:border-b-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-semibold text-gray-200">Version {log.version}</h4>
                      <span className="text-sm text-gray-400">{log.date}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                      {log.changes.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2 text-gray-500">Author: {log.author}</p>
                  </motion.div>
                ))}
              </div>
              
              {changelogData.length > INITIAL_ENTRIES_LIMIT && !showAll && (
                  <button 
                      onClick={() => setShowAll(true)}
                      className="mt-4 w-full py-2 text-center text-blue-400 hover:text-blue-300 transition"
                  >
                      Show More ({changelogData.length - INITIAL_ENTRIES_LIMIT} older entries)
                  </button>
              )}

              <motion.button
                onClick={() => setIsOpen(false)}
                className="mt-8 w-full py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChangelogModal;