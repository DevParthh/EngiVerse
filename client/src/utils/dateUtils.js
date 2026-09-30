// Filename: client/src/utils/dateUtils.js

export const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid Date check

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return date.toLocaleDateString();
};

export const formatLastSeen = (dateString) => {
    if (!dateString) return 'Offline';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Offline';

    // Basic logic: If updated within last 5 mins, show Online
    const diff = (new Date() - date) / 1000;
    if (diff < 300) return 'Online'; 

    return `Last seen ${formatRelativeTime(dateString)}`;
};