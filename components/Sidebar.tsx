import React from 'react';
import { AppView } from '../types';
import UserInfo from './UserInfo';

interface SidebarProps {
    activeView: AppView;
    setActiveView: (view: AppView) => void;
}

const iconClasses = "h-6 w-6 mr-3 text-dark-text group-hover:text-light transition-colors";
const itemClasses = "flex items-center px-4 py-3 my-1 rounded-lg cursor-pointer transition-all duration-200 group";
const activeItemClasses = "bg-accent text-white shadow-lg";
const inactiveItemClasses = "text-dark-text hover:bg-primary hover:text-light";

const menuItems = [
    { view: AppView.CREATE_STORY, label: "Tạo Câu chuyện", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-5.747-8.994l11.494 0M4.125 4.125L19.875 19.875M4.125 19.875L19.875 4.125" /> },
    { view: AppView.CREATE_PROMPTS, label: "Tạo Prompt Video", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /> },
    { view: AppView.CREATE_THUMBNAIL, label: "Tạo Ảnh Thumbnail", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> },
    { view: AppView.CREATE_VIDEO, label: "Tạo Video", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /> },
   { view: AppView.AUTO_BROWSER, label: "Tự động (Trình duyệt)", icon: (
        <>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75h-10.5a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-10.5a2.25 2.25 0 0 0-2.25-2.25Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m17.25 6.75-10.5-4.5-10.5 4.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 21.75v-10.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25v-4.5" />
        </>
    )},
    { view: AppView.AUTO_CREATE, label: "Tạo Tự Động", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.5 18l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.197a3.375 3.375 0 002.456 2.456L20.5 18l-1.197.398a3.375 3.375 0 00-2.456 2.456z" /> },
    { view: AppView.HISTORY, label: "Lịch sử", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    return (
        <aside className="w-64 bg-secondary border-r border-gray-200 flex flex-col p-4">
            <div className="flex items-center mb-8">
                <div className="p-2 bg-accent rounded-lg">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251-.124.516-.239.784-.343a3.75 3.75 0 014.932 0c.268.104.533.219.784.343v5.714a2.25 2.25 0 00.659 1.591l4.091 4.091M9.75 3.104a3.75 3.75 0 00-4.932 0c-.268.104-.533.219-.784.343v5.714a2.25 2.25 0 01-.659 1.591L.5 14.5M14.25 14.5h-4.5" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold ml-3 text-light">Veo Suite</h1>
            </div>
            <nav className="flex-1">
                {menuItems.map(item => (
                    <div
                        key={item.view}
                        className={`${itemClasses} ${activeView === item.view ? activeItemClasses : inactiveItemClasses}`}
                        onClick={() => setActiveView(item.view)}
                    >
                        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">{item.icon}</svg>
                        <span className="font-medium">{item.label}</span>
                    </div>
                ))}
            </nav>
            <UserInfo />
        </aside>
    );
};

export default Sidebar;