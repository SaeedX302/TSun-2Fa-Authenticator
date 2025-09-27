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
        className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-accent to-highlight text-text-main hover:from-highlight hover:to-accent transition font-medium shadow-lg"
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
            onClick={handleClose} // Click anywhere to close
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              ref={modalRef} 
              variants={cardVariants} 
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              className="bg-secondary/95 border border-primary/30 p-6 rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 border-b border-accent/20 pb-3">
                <h3 className="text-xl font-bold text-text-main">Version History</h3>
                <motion.button onClick={handleClose} whileHover={{ scale: 1.1, rotate: 90 }} className="p-1 rounded-full hover:bg-red-500/20">
                  <X size={22} className="text-text-light" />
                </motion.button>
              </div>

              <div className="overflow-y-auto space-y-6 pr-3 flex-grow scrollbar-thin scrollbar-thumb-highlight scrollbar-track-secondary/50 scrollbar-thumb-rounded-full">
                {displayedLogs.map((log, index) => (
                  <motion.div
                    key={log.version}
                    className="relative pl-6 border-l-2 border-accent/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-highlight rounded-full border-4 border-secondary"></div>
                    <div className="mb-2">
                        <span className="text-lg font-bold text-text-main">Version {log.version}</span>
                        <span className="text-xs text-text-light font-mono ml-2">{log.date}</span>
                    </div>
                    <ul className="mt-2 list-none space-y-1.5 text-text-light">
                      {log.changes.map((change, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <span className="text-highlight mr-2.5 mt-1">&#9679;</span>
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
