import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../common/Spinner';
import { createLabsProject, generateVeoVideo, checkVeoVideoStatus } from '../../services/labsApiService';
import { UserCookie } from '../../types';

const POLL_INTERVAL = 5000;

interface PromptItem {
    id: string;
    text: string;
    status: 'idle' | 'generating' | 'success' | 'failed';
    resultUrl?: string;
    error?: string;
    operationName?: string;
    sceneId?: string;
}

const CreateVideoView: React.FC = () => {
    const { cookies, activeCookie, setActiveCookie, labsProjects, addLabsProject } = useAppContext();
    const { showToast } = useToast();

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [prompts, setPrompts] = useState<PromptItem[]>([{ id: `prompt-${Date.now()}`, text: '', status: 'idle' }]);
    const [aspectRatio, setAspectRatio] = useState<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
    const [isCreatingProject, setIsCreatingProject] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            prompts.forEach(p => {
                if (p.status === 'generating' && p.operationName && p.sceneId && activeCookie) {
                    checkVeoVideoStatus(activeCookie, p.operationName, p.sceneId)
                        .then(operation => {
                            if (operation.status === 'MEDIA_GENERATION_STATUS_SUCCESSFUL') {
                                // [SỬA LỖI] Lấy URL từ đúng cấu trúc trả về
                                const videoUrl = operation?.operation?.metadata?.video?.fifeUrl || operation?.operation?.metadata?.video?.servingBaseUri;
                                updatePrompt(p.id, { status: 'success', resultUrl: videoUrl });
                                showToast('Tạo video thành công!', 'success');
                            } else if (operation.status === 'MEDIA_GENERATION_STATUS_FAILED' || operation.error) {
                                const error = operation?.error?.message || 'Quá trình tạo thất bại.';
                                updatePrompt(p.id, { status: 'failed', error });
                                showToast(`Tạo video thất bại: ${error}`, 'error');
                            }
                        })
                        .catch(err => {
                            console.error('Polling error:', err);
                            updatePrompt(p.id, { status: 'failed', error: 'Không thể kiểm tra trạng thái.' });
                        });
                }
            });
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [prompts, activeCookie]);

    const handleCreateProject = async () => {
        if (!activeCookie) {
            showToast('Vui lòng chọn một cookie đang hoạt động!', 'error');
            return;
        }
        setIsCreatingProject(true);
        try {
            const { projectId, projectName } = await createLabsProject(activeCookie);
            const newProject = { id: projectId, name: projectName };
            addLabsProject(newProject);
            setSelectedProjectId(newProject.id);
            showToast(`Project "${projectName}" đã được tạo!`, 'success');
        } catch (error: any) {
            showToast(`Không thể tạo project: ${error.message}`, 'error');
        } finally {
            setIsCreatingProject(false);
        }
    };

    const handleCookieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCookieId = e.target.value;
        const newActiveCookie = cookies.find(c => c.id === selectedCookieId) || null;
        setActiveCookie(newActiveCookie);
        if (newActiveCookie) {
            showToast(`Cookie "${newActiveCookie.name}" đã được kích hoạt.`, 'success');
        }
    };
    
    const addPrompt = () => {
        setPrompts(prev => [...prev, { id: `prompt-${Date.now()}`, text: '', status: 'idle' }]);
    };
    
    const updatePrompt = (id: string, updates: Partial<PromptItem>) => {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const handleGenerate = async (promptId: string) => {
        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt || !prompt.text.trim()) {
            showToast('Vui lòng nhập prompt.', 'error');
            return;
        }
        if (!activeCookie) {
            showToast('Vui lòng chọn một cookie đang hoạt động.', 'error');
            return;
        }
        if (!selectedProjectId) {
            showToast('Vui lòng tạo hoặc chọn một project.', 'error');
            return;
        }

        updatePrompt(promptId, { status: 'generating', error: undefined, resultUrl: undefined });

        try {
            const { operationName, sceneId } = await generateVeoVideo(activeCookie, selectedProjectId, prompt.text, aspectRatio);
            updatePrompt(promptId, { operationName, sceneId });
        } catch (error: any) {
            updatePrompt(promptId, { status: 'failed', error: error.message });
            showToast(`Lỗi: ${error.message}`, 'error');
        }
    };


    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-light mb-2">Create Video (Labs API)</h1>
            <p className="text-dark-text mb-6">Sử dụng cookie và token để tạo video trực tiếp với model Veo.</p>
            
            <div className="bg-secondary p-4 rounded-lg shadow-md mb-6 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-dark-text mb-1">Active Cookie</label>
                    <select 
                        value={activeCookie?.id || ''} 
                        onChange={handleCookieChange}
                        className="w-full p-2 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent"
                    >
                        <option value="">-- Chọn Cookie & Token --</option>
                        {cookies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-dark-text mb-1">Project</label>
                    <select 
                        value={selectedProjectId} 
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="w-full p-2 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent"
                    >
                        <option value="">-- Chọn Project --</option>
                        {labsProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                
                <div className="flex items-end gap-2">
                    <button onClick={handleCreateProject} disabled={isCreatingProject || !activeCookie} className="bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 flex items-center">
                        {isCreatingProject && <Spinner className="w-4 h-4 mr-2"/>}
                        Create Project
                    </button>
                     <button disabled className="bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded-lg cursor-not-allowed">Load Projects</button>
                </div>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg shadow-md mb-6 flex items-center gap-4">
                <label className="font-bold text-dark-text">Aspect Ratio:</label>
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} className="p-2 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent">
                    <option value="LANDSCAPE">16:9 Landscape</option>
                    <option value="PORTRAIT">9:16 Portrait</option>
                </select>
                <label className="font-bold text-dark-text ml-4">Model:</label>
                 <input type="text" value="veo_3_0_t2v_fast" disabled className="p-2 bg-gray-200 text-gray-500 rounded-md border border-border-color cursor-not-allowed" />
            </div>

            <div className="space-y-4">
                {prompts.map((prompt, index) => (
                    <div key={prompt.id} className="bg-secondary p-4 rounded-lg shadow-md grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-dark-text font-bold mb-2">Prompt #{index + 1}</label>
                             <textarea
                                value={prompt.text}
                                onChange={e => updatePrompt(prompt.id, { text: e.target.value })}
                                placeholder="A cinematic shot of..."
                                className="w-full h-32 p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent"
                            />
                            <button onClick={() => handleGenerate(prompt.id)} disabled={prompt.status === 'generating' || !activeCookie || !selectedProjectId} className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 flex justify-center items-center">
                                {prompt.status === 'generating' ? <><Spinner className="w-5 h-5 mr-2"/> Generating...</> : 'Generate'}
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-primary rounded-md border border-border-color p-4">
                            {prompt.status === 'success' && prompt.resultUrl ? (
                                <video src={prompt.resultUrl} controls className="w-full h-full object-contain rounded-md"></video>
                            ) : prompt.status === 'generating' ? (
                                <div className="text-center">
                                    <Spinner className="w-8 h-8 text-accent mx-auto" />
                                    <p className="mt-2 text-dark-text">Processing video...</p>
                                    <p className="text-xs text-gray-400">This may take several minutes.</p>
                                </div>
                            ) : prompt.status === 'failed' ? (
                                <div className="text-center text-red-500">
                                    <p className="font-bold">Generation Failed</p>
                                    <p className="text-xs">{prompt.error}</p>
                                </div>
                            ) : (
                                <p className="text-dark-text">Result will appear here</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addPrompt} className="mt-4 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-4 rounded-lg border border-blue-300">
                + Add Another Prompt
            </button>
        </div>
    );
};

export default CreateVideoView;