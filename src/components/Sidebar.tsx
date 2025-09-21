import React from 'react';
import { AppView } from '../types';
import UserInfo from './UserInfo';

interface SidebarProps {
    activeView: AppView;
    setActiveView: (view: AppView) => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

const menuItems = [
    { view: AppView.CREATE_STORY, label: "Tạo Câu chuyện", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /> },
    { view: AppView.GET_YOUTUBE_SCRIPT, label: "Kịch bản YouTube", icon: <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /> },
    { view: AppView.CREATE_PROMPTS, label: "Tạo Prompt Video", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /> },
    { view: AppView.CREATE_THUMBNAIL, label: "Tạo Ảnh Thumbnail", icon: <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /> },
    { view: AppView.CREATE_VIDEO, label: "Tạo Video", icon: (
        <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
        </>
    )},
    { view: AppView.AUTO_CREATE, label: "Tạo Tự Động", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /> },
    
        { view: AppView.AUTO_BROWSER, label: "Tự động (Trình duyệt)", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75h-10.5a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-10.5a2.25 2.25 0 0 0-2.25-2.25Z" /> },


    { view: AppView.HISTORY, label: "Lịch sử", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> },
    // --- THAY ĐỔI ICON Ở ĐÂY ---
    { view: AppView.MANAGE_COOKIES, label: "Quản lý Cookie", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15.647a4.5 4.5 0 0 0-4.241-4.241H8.25a4.5 4.5 0 0 0-4.241 4.241 4.5 4.5 0 0 0 4.241 4.241h.209a4.5 4.5 0 0 0 4.241-4.241Zm-3.14-8.492a4.5 4.5 0 0 0-4.241 4.241H5.16a4.5 4.5 0 0 0-4.241-4.241 4.5 4.5 0 0 0 4.241-4.241v-.209a4.5 4.5 0 0 0 4.241 4.241Z" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setIsCollapsed }) => {
    
    const commonItemClasses = "flex items-center py-3 my-1 rounded-lg cursor-pointer transition-all duration-200 group";
    const activeItemClasses = "bg-accent text-white shadow-lg";
    const inactiveItemClasses = "text-dark-text hover:bg-primary hover:text-light";

    return (
        <aside className={`bg-secondary border-r border-border-color flex flex-col p-4 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex items-center mb-8 relative">
                <div className="p-2 bg-accent rounded-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251-.124.516-.239.784-.343a3.75 3.75 0 014.932 0c.268.104.533.219.784.343v5.714a2.25 2.25 0 00.659 1.591l4.091 4.091M9.75 3.104a3.75 3.75 0 00-4.932 0c-.268.104-.533.219-.784.343v5.714a2.25 2.25 0 01-.659 1.591L.5 14.5M14.25 14.5h-4.5" />
                    </svg>
                </div>
                {!isCollapsed && <h1 className="text-xl font-bold ml-3 text-light whitespace-nowrap">Veo Suite</h1>}

                <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-7 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-100 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
            </div>

            <nav className="flex-1">
                {menuItems.map(item => (
                    <div
                        key={item.view}
                        className={`${commonItemClasses} ${activeView === item.view ? activeItemClasses : inactiveItemClasses} ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                        onClick={() => setActiveView(item.view)}
                        title={isCollapsed ? item.label : undefined}
                    >
                        {/* --- THAY ĐỔI MÀU SẮC ICON --- */}
                        <svg className={`h-6 w-6 transition-colors ${isCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">{item.icon}</svg>
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    </div>
                ))}
            </nav>
            
            <div className="border-t border-border-color pt-2">
                 <div
                    className={`${commonItemClasses} ${activeView === AppView.API_KEY ? activeItemClasses : inactiveItemClasses} ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}
                    onClick={() => setActiveView(AppView.API_KEY)}
                    title={isCollapsed ? "Cài đặt API Key" : undefined}
                >
                    {/* --- THAY ĐỔI MÀU SẮC ICON --- */}
                    <svg className={`h-6 w-6 transition-colors ${isCollapsed ? '' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>
                    {!isCollapsed && <span className="font-medium whitespace-nowrap">Cài đặt API Key</span>}
                </div>
            </div>
            
            <UserInfo isCollapsed={isCollapsed} />
        </aside>
    );
};

export default Sidebar;