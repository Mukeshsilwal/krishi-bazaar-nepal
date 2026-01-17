import React from 'react';

interface ChatLayoutProps {
    sidebar: React.ReactNode;
    main: React.ReactNode;
    showSidebarOnMobile: boolean;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ sidebar, main, showSidebarOnMobile }) => {
    return (
        <div className="bg-gray-50 h-[calc(100vh-64px)] flex flex-col">
            <div className="flex-1 max-w-7xl w-full mx-auto px-0 sm:px-6 lg:px-8 py-2 sm:py-6 overflow-hidden">
                <div className="bg-white rounded-lg shadow-lg h-full flex overflow-hidden border border-gray-200">
                    {/* Sidebar */}
                    <div className={`${showSidebarOnMobile ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 lg:w-1/4 flex-col border-r border-gray-200`}>
                        {sidebar}
                    </div>

                    {/* Main Content */}
                    <div className={`${!showSidebarOnMobile ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full`}>
                        {main}
                    </div>
                </div>
            </div>
        </div>
    );
};
