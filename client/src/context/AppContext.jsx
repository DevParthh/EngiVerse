import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from 'react-toastify';

export const AppContent = createContext(null);

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [notificationTrigger, setNotificationTrigger] = useState(0);

    // Fetch User Status
    useEffect(() => {
        const checkUserStatus = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
                if (data.success) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.log("User not authenticated.");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUserStatus();
    }, [backendUrl]);

    // Socket Connection & Notification Listener
    useEffect(() => {
        if (user?._id) {
            // 1. Initialize Socket
            const newSocket = io(backendUrl, {
                query: { userId: user._id },
                transports: ['websocket'] 
            });

            setSocket(newSocket);

            // 2. Define Handler (Prevents duplicates by being a named function)
            const handleNewNotification = (notification) => {
                setNotificationTrigger(prev => prev + 1); // Trigger re-fetch in other components

                // Dynamic Toast based on Notification Type
                // Yeh logic ensure karega ki Task/Offer ke liye sahi message dikhe
                switch(notification.type) {
                    case 'friend_request':
                        toast.info(`👋 ${notification.message}`);
                        break;
                    case 'offer_accepted':
                        toast.success(`🚀 ${notification.title}`);
                        break;
                    case 'new_offer':
                        toast.info(`💼 ${notification.title}: ${notification.message}`);
                        break;
                    case 'payment_received':
                        toast.success(`💰 ${notification.title}`);
                        break;
                    case 'system_alert':
                        toast.warn(`📢 ${notification.title}`);
                        break;
                    default:
                        // Fallback for generic notifications
                        toast.info(`🔔 ${notification.title || 'New Notification'}`);
                }
            };

            // 3. Attach Listener
            newSocket.on('newNotification', handleNewNotification);
            
            // 4. Cleanup (CRITICAL for preventing duplicates)
            return () => {
                newSocket.off('newNotification', handleNewNotification); // Remove listener first
                newSocket.close(); // Then close connection
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user?._id, backendUrl]); 

    const value = {
        backendUrl,
        user,
        setUser,
        loading,
        socket,
        notificationTrigger, // Expose this so components can refetch data
        setNotificationTrigger
    };

    return (
        <AppContent.Provider value={value}>{props.children}</AppContent.Provider>
    );
};