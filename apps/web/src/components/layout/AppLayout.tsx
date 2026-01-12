import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '../Navbar';
import Footer from '../Footer';

const AppLayout = () => {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* 
                   We could put the Navbar here. 
                   If Navbar duplicates Sidebar links, we should ideally use a 'TopBar' component.
                   However, existing Navbar has mobile menu logic which is useful.
                   Let's keep Navbar for now but maybe pass a prop 'isAppLayout' to hide redundant links?
                   Or just let it be for this step to ensure functionality.
                */}
                <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
                    <Navbar variant="dashboard" />
                </div>

                <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto animate-fade-in-up">
                        <Outlet />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default AppLayout;
