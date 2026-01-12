import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Simple Navbar for Public/Auth pages */}
            <Navbar />

            <main className="flex-1 bg-gray-50 flex flex-col justify-center">
                <div className="animate-fade-in-up w-full">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PublicLayout;
