import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import CreateStoryView from './components/views/CreateStoryView';
import CreatePromptsView from './components/views/CreatePromptsView';
import CreateThumbnailView from './components/views/CreateThumbnailView';
import CreateVideoView from './components/views/CreateVideoView';
import AutoCreateView from './components/views/AutoCreateView';
import AutoBrowserView from './components/views/AutoBrowserView'; // Thêm import
import HistoryView from './components/views/HistoryView';
import CreateScriptView from './components/views/CreateScriptView';
import ApiKeyView from './components/views/ApiKeyView';
import ManageCookiesView from './components/views/ManageCookiesView';
import { AppView } from './types';
import { getApiKey } from './services/geminiService';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<AppView>(AppView.CREATE_STORY);
    const [isKeyRequired, setIsKeyRequired] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        const checkApiKey = () => {
            const apiKey = getApiKey();
            if (!apiKey) {
                setIsKeyRequired(true);
            } else {
                setIsKeyRequired(false);
            }
        };
        checkApiKey();
    }, []);

    const handleKeySaved = () => {
        setIsKeyRequired(false);
        setActiveView(AppView.CREATE_STORY);
    };

    const renderView = () => {
        if (isKeyRequired) {
            return <ApiKeyView onKeySaved={handleKeySaved} />;
        }
        
        switch (activeView) {
            case AppView.CREATE_STORY:
                return <CreateStoryView />;
            case AppView.CREATE_PROMPTS:
                return <CreatePromptsView />;
            case AppView.CREATE_THUMBNAIL:
                return <CreateThumbnailView />;
            case AppView.CREATE_VIDEO:
                return <CreateVideoView />;
            case AppView.AUTO_CREATE:
                return <AutoCreateView />;
            // [SỬA ĐỔI] Thêm case cho view mới
            case AppView.AUTO_BROWSER:
                return <AutoBrowserView />;
            case AppView.HISTORY:
                return <HistoryView />;
            case AppView.GET_YOUTUBE_SCRIPT:
                 return <CreateScriptView />;
            case AppView.API_KEY:
                return <ApiKeyView onKeySaved={handleKeySaved} />;
            case AppView.MANAGE_COOKIES:
                return <ManageCookiesView />;
            default:
                return <CreateStoryView />;
        }
    };

    return (
        <AppProvider>
            <ToastProvider>
                <div className="flex h-screen bg-primary font-sans">
                    {!isKeyRequired && (
                        <Sidebar 
                            activeView={activeView} 
                            setActiveView={setActiveView}
                            isCollapsed={isSidebarCollapsed}
                            setIsCollapsed={setIsSidebarCollapsed}
                        />
                    )}
                    <main className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                            {renderView()}
                        </div>
                    </main>
                </div>
            </ToastProvider>
        </AppProvider>
    );
}

export default App;