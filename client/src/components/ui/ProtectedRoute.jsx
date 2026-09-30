// Filename: client/src/components/ui/ProtectedRoute.jsx (FINAL CORRECTED VERSION)

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContent } from '../../context/AppContext';

const ProtectedRoute = () => {
    const { user, loading } = useContext(AppContent);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // If the user is authenticated, render the Outlet, which will display the correct nested route.
    // Otherwise, redirect to the login page.
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;