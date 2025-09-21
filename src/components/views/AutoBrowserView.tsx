import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Spinner from '../common/Spinner';
import { UserCookie, Story, VideoPrompt } from '../../types';

type AutomationPrompt = {
    id: string;
    text: string;
    status: 'idle' | 'running' | 'success' | 'error';
    logs: string[];
};

const AutoBrowserView: React.FC = () => {
    const { cookies, activeCookie, setActiveCookie, stories, prompts: allPrompts } = useAppContext();
    
    const [automationPrompts, setAutomationPrompts] = useState<AutomationPrompt[]>([
        { id: `prompt-${Date.now()}`, text: '', status: 'idle', logs: [] }
    ]);
    const [selectedStoryId, setSelectedStoryId] = useState<string>('');
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    useEffect(() => {
        const unsubscribe = window.electronAPI.onBrowserLog((log: { promptId: string, message: string, status?: AutomationPrompt['status'] }) => {
            setAutomationPrompts(prev => prev.map(p => {
                if (p.id === log.promptId) {
                    const newLogs = [...p.logs, log.message];
                    if (log.status) {
                        if (log.status === 'success' || log.status === 'error') {
                            setIsGeneratingAll(false);
                        }
                        return { ...p, status: log.status, logs: newLogs };
                    }
                    return { ...p, logs: newLogs };
                }
                return p;
            }));
        });
        return () => unsubscribe();
    }, []);

    const handleStoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const storyId = e.target.value;
        setSelectedStoryId(storyId);
        if (storyId) {
            const relatedPrompts = allPrompts.filter(p => p.storyId === storyId);
            if (relatedPrompts.length > 0) {
                setAutomationPrompts(relatedPrompts.map(p => ({
                    id: p.id,
                    text: p.prompt,
                    status: 'idle',
                    logs: []
                })));
            }
        } else {
            setAutomationPrompts([{ id: `prompt-${Date.now()}`, text: '', status: 'idle', logs: [] }]);
        }
    };

    // Chạy tự động cho một prompt riêng lẻ
    const handleRun = (promptId: string) => {
        const promptToRun = automationPrompts.find(p => p.id === promptId);
        if (!activeCookie || !promptToRun || !promptToRun.text.trim()) {
            alert('Vui lòng chọn Cookie và nhập prompt.');
            return;
        }
        setAutomationPrompts(prev => prev.map(p => p.id === promptId ? {...p, logs: [], status: 'running'} : p));
        // [SỬA LỖI] Thêm 'activeCookie' làm tham số thứ hai
        window.electronAPI.startBrowserAutomation([promptToRun], activeCookie);
    };

    // Chạy tự động cho tất cả prompts
    const handleRunAll = () => {
        if (!activeCookie || !automationPrompts.some(p => p.text.trim())) {
            alert('Vui lòng chọn Cookie và có ít nhất một prompt để chạy.');
            return;
        }
        setIsGeneratingAll(true);
        const promptsToRun = automationPrompts.filter(p => p.text.trim());
        setAutomationPrompts(prev => prev.map(p => promptsToRun.some(ptr => ptr.id === p.id) ? {...p, logs: [], status: 'running'} : p));
        // [SỬA LỖI] Thêm 'activeCookie' làm tham số thứ hai
        window.electronAPI.startBrowserAutomation(promptsToRun, activeCookie);
    };

    const addPromptField = () => {
        setAutomationPrompts(prev => [...prev, { id: `prompt-${Date.now()}`, text: '', status: 'idle', logs: [] }]);
    };
    
    const updatePromptText = (id: string, text: string) => {
        setAutomationPrompts(prev => prev.map(p => p.id === id ? { ...p, text } : p));
    };

    const handleCookieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCookieId = e.target.value;
        const cookie = cookies.find((c: UserCookie) => c.id === selectedCookieId) || null;
        setActiveCookie(cookie);
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-light mb-2">Tự động hóa bằng Trình duyệt</h1>
            <p className="text-dark-text mb-6">Tự động mở trình duyệt, đăng nhập, và tạo video theo danh sách prompts.</p>
            
            <div className="bg-secondary p-4 rounded-lg shadow-md mb-6 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-dark-text mb-1">Chọn Cookie Đăng nhập</label>
                    <select value={activeCookie?.id || ''} onChange={handleCookieChange} className="w-full p-2 bg-primary rounded-md border border-border-color">
                        <option value="">-- Chọn Cookie --</option>
                        {cookies.map((c: UserCookie) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-dark-text mb-1">Chọn Câu chuyện (để tải prompts)</label>
                    <select value={selectedStoryId} onChange={handleStoryChange} className="w-full p-2 bg-primary rounded-md border border-border-color">
                        <option value="">-- Tải prompt từ câu chuyện --</option>
                        {stories.map((s: Story) => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                </div>
                <div className="flex items-end">
                    <button onClick={handleRunAll} disabled={isGeneratingAll || !activeCookie} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 flex items-center">
                         {isGeneratingAll && <Spinner className="w-4 h-4 mr-2"/>}
                        Chạy tất cả
                    </button>
                </div>
            </div>

            <div className="bg-secondary p-4 rounded-lg shadow-md mb-6 flex items-center gap-4">
                <label className="font-bold text-dark-text">Model:</label>
                <input type="text" value="veo_3_0_t2v_fast" disabled className="p-2 bg-gray-200 text-gray-500 rounded-md border-border-color" />
                <label className="font-bold text-dark-text ml-4">Tỷ lệ:</label>
                <select className="p-2 bg-primary rounded-md border border-border-color">
                    <option>16:9 Landscape</option>
                    <option>9:16 Portrait</option>
                </select>
            </div>

            <div className="space-y-4">
                {automationPrompts.map((prompt, index) => (
                    <div key={prompt.id} className="bg-secondary p-4 rounded-lg shadow-md grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-dark-text font-bold">Prompt #{index + 1}</label>
                                {prompt.status === 'idle' && <button onClick={() => handleRun(prompt.id)} className="bg-accent text-white text-xs font-bold py-1 px-3 rounded">Tạo</button>}
                                {prompt.status === 'running' && <span className="text-blue-500 text-xs font-bold flex items-center"><Spinner className="w-4 h-4 mr-1"/> Đang chạy...</span>}
                                {prompt.status === 'success' && <span className="text-green-500 text-xs font-bold">Hoàn thành</span>}
                                {prompt.status === 'error' && <button onClick={() => handleRun(prompt.id)} className="bg-red-500 text-white text-xs font-bold py-1 px-3 rounded">Thử lại</button>}
                            </div>
                            <textarea
                                value={prompt.text}
                                onChange={e => updatePromptText(prompt.id, e.target.value)}
                                className="w-full h-32 p-2 bg-primary rounded-md border border-border-color"
                            />
                        </div>
                        <div className="flex flex-col items-center justify-center bg-primary rounded-md border border-border-color p-2">
                             <div className="w-full h-full overflow-y-auto font-mono text-xs text-dark-text">
                                {prompt.logs.map((log, i) => (
                                    <p key={i} className="whitespace-pre-wrap">&gt; {log}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addPromptField} className="mt-4 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded-lg border border-blue-300">
                + Thêm Prompt
            </button>
        </div>
    );
};

export default AutoBrowserView;