// utils/iconMapping.ts

export const supportedServices = [
    'Google',
    'GitHub',
    'Microsoft',
    'Amazon',
    'Vercel',
    'GitLab',
    'Dropbox',
    'Slack',
    'Twitter',
    'Facebook',
    'Instagram',
    'Apple',
];

export const getServiceIcon = (serviceName: string): string => {
    const iconMap: { [key: string]: string } = {
        'google': 'fab fa-google',
        'github': 'fab fa-github',
        'microsoft': 'fab fa-microsoft',
        'amazon': 'fab fa-amazon',
        'vercel': 'fab fa-vercel',
        'gitlab': 'fab fa-gitlab',
        'dropbox': 'fab fa-dropbox',
        'slack': 'fab fa-slack',
        'twitter': 'fab fa-x-twitter',
        'facebook': 'fab fa-facebook',
        'instagram': 'fab fa-instagram',
        'apple': 'fab fa-apple',
    };
    return iconMap[serviceName.toLowerCase()] || 'fas fa-shield-alt'; // Default icon
};
