import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import CreateStoryView from './components/views/CreateStoryView';
import CreatePromptsView from './components/views/CreatePromptsView';
import CreateThumbnailView from './components/views/CreateThumbnailView';
import CreateVideoView from './components/views/CreateVideoView';
import AutoCreateView from './components/views/AutoCreateView';
import HistoryView from './components/views/HistoryView';
import { AppView } from './types';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<AppView>(AppView.CREATE_STORY);

    const renderView = () => {
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
            case AppView.HISTORY:
                return <HistoryView />;
            default:
                return <CreateStoryView />;
        }
    };

    return (
        <AppProvider>
            <ToastProvider>
                <div className="flex h-screen bg-primary font-sans">
                    <Sidebar activeView={activeView} setActiveView={setActiveView} />
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