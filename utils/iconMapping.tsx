// utils/iconMapping.tsx

import {
    FaGoogle, FaGithub, FaMicrosoft, FaAmazon, FaVercel, FaGitlab, FaDropbox, FaSlack, FaTwitter, FaFacebook, FaInstagram, FaApple, FaShieldAlt
} from 'react-icons/fa';
import { SiNextdotjs } from 'react-icons/si';

export const supportedServices = [
    'Google', 'GitHub', 'Microsoft', 'Amazon', 'Vercel', 'GitLab',
    'Dropbox', 'Slack', 'Twitter', 'Facebook', 'Instagram', 'Apple', 'Next.js'
];

export const getServiceIcon = (serviceName: string) => {
    const size = 24;
    const iconMap: { [key: string]: React.ReactElement } = {
        'google': <FaGoogle size={size} color="#DB4437" />,
        'github': <FaGithub size={size} color="#181717" />,
        'microsoft': <FaMicrosoft size={size} color="#00A4EF" />,
        'amazon': <FaAmazon size={size} color="#FF9900" />,
        'vercel': <SiNextdotjs size={size} color="#000000" />,
        'gitlab': <FaGitlab size={size} color="#FCA121" />,
        'dropbox': <FaDropbox size={size} color="#0061FF" />,
        'slack': <FaSlack size={size} color="#4A154B" />,
        'twitter': <FaTwitter size={size} color="#1DA1F2" />,
        'facebook': <FaFacebook size={size} color="#1877F2" />,
        'instagram': <FaInstagram size={size} color="#E4405F" />,
        'apple': <FaApple size={size} color="#A3AAAE" />,
        'next.js': <SiNextdotjs size={size} color="#000000" />,
    };
    return iconMap[serviceName.toLowerCase()] || <FaShieldAlt size={size} color="#8B5CF6" />;
};
