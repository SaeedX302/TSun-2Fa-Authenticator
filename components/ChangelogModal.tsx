// components/ChangelogModal.tsx
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import changelogData from '@/data/changelog.json';
import { X } from 'lucide-react';

const INITIAL_ENTRIES_LIMIT = 4;

interface ChangelogModalProps {
  currentVersion: string;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ currentVersion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const displayedLogs = changelogData.slice(0, INITIAL_ENTRIES_LIMIT);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 50 },
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="text-sm px-4 py-2 rounded-lg bg-accent border border-highlight/50 text-text-dark hover:bg-highlight hover:text-primary transition-colors font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-opacity-50"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        App Updates
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose} // Click anywhere to close
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              ref={modalRef}
              variants={cardVariants}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="glass-card p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border-accent/20"
            >
              <div className="flex justify-between items-center mb-4 border-b border-highlight/30 pb-3">
                <h3 className="text-2xl font-bold text-text-dark">Version History</h3>
                <motion.button onClick={handleClose} whileHover={{ scale: 1.1, rotate: 90 }} className="p-1 rounded-full hover:bg-red-500/20">
                  <X size={22} className="text-text-light" />
                </motion.button>
              </div>

              <div className="overflow-y-auto space-y-8 pr-3 flex-grow scrollbar-thin scrollbar-thumb-highlight scrollbar-track-secondary/50 scrollbar-thumb-rounded-full">
                {displayedLogs.map((log, index) => (
                  <motion.div
                    key={log.version}
                    className="relative pl-8 border-l-2 border-accent/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="absolute -left-[10px] top-1 w-5 h-5 bg-highlight rounded-full border-4 border-primary"></div>
                    <div className="mb-2">
                        <span className="text-xl font-bold text-text-dark">Version {log.version}</span>
                        <span className="text-sm text-text-light font-mono ml-3">{log.date}</span>
                    </div>
                    <ul className="mt-3 list-disc list-inside space-y-2 text-text-main">
                      {log.changes.map((change, i) => (
                        <li key={i} className="text-sm">
                          {change}
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
