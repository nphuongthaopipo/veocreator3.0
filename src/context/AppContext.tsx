import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Story, VideoPrompt, GeneratedImage, GeneratedVideo, YouTubeScript, UserCookie, LabsProject } from '../types';

// Hook tùy chỉnh để đồng bộ state với localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Lỗi khi đọc localStorage key “${key}”:`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            const valueToStore = JSON.stringify(storedValue);
            window.localStorage.setItem(key, valueToStore);
        } catch (error) {
            console.error(`Lỗi khi lưu vào localStorage key “${key}”:`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}

// Khai báo đầy đủ các thuộc tính sẽ được cung cấp bởi context
interface AppContextType {
    stories: Story[];
    addStory: (story: Story) => void;
    updateStory: (id: string, updates: Partial<Story>) => void;
    deleteStory: (id: string) => void;
    prompts: VideoPrompt[];
    addPrompts: (newPrompts: VideoPrompt[]) => void;
    deletePrompt: (id: string) => void;
    thumbnails: GeneratedImage[];
    addThumbnail: (thumbnail: GeneratedImage) => void;
    deleteThumbnail: (id: string) => void;
    videos: GeneratedVideo[];
    addVideo: (video: GeneratedVideo) => void;
    updateVideo: (id: string, updates: Partial<GeneratedVideo>) => void;
    youtubeScripts: YouTubeScript[];
    addYouTubeScript: (script: YouTubeScript) => void;
    deleteYouTubeScript: (id: string) => void;
    labsProjects: LabsProject[];
    addLabsProject: (project: LabsProject) => void;
    cookies: UserCookie[];
    addCookie: (cookie: UserCookie) => void;
    updateCookie: (id: string, updates: Partial<UserCookie>) => void;
    deleteCookie: (id: string) => void;
    activeCookie: UserCookie | null;
    setActiveCookie: (cookie: UserCookie | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [stories, setStories] = useLocalStorage<Story[]>('veo-suite-stories', []);
    const [prompts, setPrompts] = useLocalStorage<VideoPrompt[]>('veo-suite-prompts', []);
    const [thumbnails, setThumbnails] = useLocalStorage<GeneratedImage[]>('veo-suite-thumbnails', []);
    const [videos, setVideos] = useLocalStorage<GeneratedVideo[]>('veo-suite-videos', []);
    const [youtubeScripts, setYoutubeScripts] = useLocalStorage<YouTubeScript[]>('veo-suite-youtube-scripts', []);
    const [cookies, setCookies] = useLocalStorage<UserCookie[]>('veo-suite-cookies', []);
    const [activeCookie, setActiveCookie] = useLocalStorage<UserCookie | null>('veo-suite-active-cookie', null);
    const [labsProjects, setLabsProjects] = useLocalStorage<LabsProject[]>('veo-suite-labs-projects', []);

    const addStory = (story: Story) => setStories(prev => [story, ...prev]);
    const updateStory = (id: string, updates: Partial<Story>) => setStories(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const deleteStory = (id: string) => setStories(prev => prev.filter(s => s.id !== id));

    const addPrompts = (newPrompts: VideoPrompt[]) => setPrompts(prev => [...newPrompts, ...prev]);
    const deletePrompt = (id: string) => setPrompts(prev => prev.filter(p => p.id !== id));

    const addThumbnail = (thumbnail: GeneratedImage) => setThumbnails(prev => [thumbnail, ...prev]);
    const deleteThumbnail = (id: string) => setThumbnails(prev => prev.filter(t => t.id !== id));

    const addVideo = (video: GeneratedVideo) => setVideos(prev => [video, ...prev]);
    const updateVideo = (id: string, updates: Partial<GeneratedVideo>) => setVideos(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

    const addYouTubeScript = (script: YouTubeScript) => setYoutubeScripts(prev => [script, ...prev]);
    const deleteYouTubeScript = (id: string) => setYoutubeScripts(prev => prev.filter(s => s.id !== id));

    const addCookie = (cookie: UserCookie) => setCookies(prev => [cookie, ...prev]);
    const updateCookie = (id: string, updates: Partial<UserCookie>) => setCookies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const deleteCookie = (id: string) => setCookies(prev => prev.filter(c => c.id !== id));

    const addLabsProject = (project: LabsProject) => setLabsProjects(prev => [project, ...prev]);

    return (
        <AppContext.Provider value={{ 
            stories, addStory, updateStory, deleteStory, 
            prompts, addPrompts, deletePrompt,
            thumbnails, addThumbnail, deleteThumbnail,
            videos, addVideo, updateVideo,
            youtubeScripts, addYouTubeScript, deleteYouTubeScript,
            labsProjects, addLabsProject,
            cookies, addCookie, updateCookie, deleteCookie,
            activeCookie, setActiveCookie,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};