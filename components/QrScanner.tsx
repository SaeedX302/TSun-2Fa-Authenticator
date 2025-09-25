// components/QrScanner.tsx
'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { motion } from 'framer-motion';

interface QrScannerProps {
    onScan: (result: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan }) => {
    const webcamRef = useRef<Webcam>(null);
    const codeReader = useRef(new BrowserMultiFormatReader());
    const [isScanning, setIsScanning] = useState(false);

    const videoConstraints = {
        facingMode: { exact: "environment" } // Mobile par back camera use karega
    };

    const scan = useCallback(async () => {
        if (webcamRef.current && webcamRef.current.video) {
            try {
                const result = await codeReader.current.decodeFromVideoElement(webcamRef.current.video);
                if (result) {
                    onScan(result.getText());
                    codeReader.current.reset(); // Scanning stop karen
                }
            } catch (err) {
                // Keep trying to decode
            }
        }
    }, [onScan]);

    useEffect(() => {
        if (!isScanning) {
            setIsScanning(true);
            const intervalId = setInterval(scan, 1000); // Har 1 second mein scan karein
            return () => {
                clearInterval(intervalId);
                codeReader.current.reset();
                setIsScanning(false);
            };
        }
    }, [scan]);


    return (
        <motion.div
            className="relative overflow-hidden rounded-lg shadow-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Webcam
                audio={false}
                ref={webcamRef}
                videoConstraints={videoConstraints}
                className="w-full h-auto rounded-lg"
            />
            {/* Scanner Animation Effect */}
            <motion.div
                initial={{ y: '0%' }}
                animate={{ y: '100%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute left-0 w-full h-1 bg-red-500 shadow-2xl shadow-red-500/80"
                style={{ top: '0%' }}
            />
            <p className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-center text-sm text-white">Scanning for QR Code... 🤳</p>
        </motion.div>
    );
};

export default QrScanner;