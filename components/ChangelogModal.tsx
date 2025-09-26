// components/ChangelogModal.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import changelogData from '@/data/changelog.json';
import { X } from 'lucide-react';

const INITIAL_ENTRIES_LIMIT = 4;

interface ChangelogModalProps {
  currentVersion: string;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ currentVersion }) => {
  const [isOpen, setIsOpen] = useState(false);

  const displayedLogs = changelogData.slice(0, INITIAL_ENTRIES_LIMIT);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition font-medium shadow-lg"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        v{currentVersion} Changelog
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
          >
            <motion.div className="bg-gray-900/60 border border-blue-500/30 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-blue-300">Version History</h3>
                <motion.button onClick={() => setIsOpen(false)} whileHover={{ scale: 1.1, rotate: 90 }} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40">
                  <X size={20} className="text-red-300" />
                </motion.button>
              </div>

              <div className="overflow-y-auto space-y-6 pr-2 flex-grow scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-gray-800/50">
                {displayedLogs.map((log, index) => (
                  <motion.div
                    key={log.version}
                    className="relative pl-8 border-l-2 border-blue-500/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="absolute -left-[10px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-gray-800"></div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-md font-semibold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full">Version {log.version}</span>
                      <span className="text-xs text-gray-500 font-mono">{log.date}</span>
                    </div>
                    <ul className="mt-3 list-none space-y-2 text-gray-400">
                      {log.changes.map((change, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-400 mr-2">&#10022;</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChangelogModal;
