import React, { useCallback, useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { generateVideo, checkVideoStatus, getVideoUrl } from '../../services/geminiService';
import { GeneratedVideo, VideoPrompt } from '../../types';
import Spinner from '../common/Spinner';
import { Operation, GenerateVideosResponse } from '@google/genai';

const POLL_INTERVAL = 10000; // 10 seconds

const CreateVideoView: React.FC = () => {
    const { stories, prompts, videos, addVideo, updateVideo } = useAppContext();
    const [selectedStoryId, setSelectedStoryId] = useState('');
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    const handleGenerateVideo = useCallback(async (prompt: VideoPrompt) => {
        const { id: promptId, prompt: promptText } = prompt;

        // Prevent duplicate generation if already processing or completed
        const existingVideo = videos.find(v => v.promptId === promptId);
        if (existingVideo && existingVideo.status !== 'failed') return;

        const videoId = existingVideo ? existingVideo.id : `${promptId}-${Date.now()}`;
        const videoData: GeneratedVideo = {
            id: videoId,
            promptId,
            promptText,
            status: 'pending',
            progressMessage: 'Bắt đầu yêu cầu...'
        };
        
        if (existingVideo) {
            updateVideo(videoId, videoData);
        } else {
            addVideo(videoData);
        }

        try {
            const initialOperation = await generateVideo(promptText);
            updateVideo(videoId, { status: 'processing', progressMessage: 'Đang xử lý... (có thể mất vài phút)' });

            const poll = async (operation: Operation<GenerateVideosResponse>) => {
                try {
                    const statusOperation = await checkVideoStatus(operation);

                    if (statusOperation.done) {
                        // FIX: Removed `await` from `getVideoUrl` as it is a synchronous function.
                        const url = getVideoUrl(statusOperation);
                        if (url) {
                            updateVideo(videoId, { status: 'completed', videoUrl: url, progressMessage: 'Hoàn thành!' });
                        } else {
                             const errorMessage = (statusOperation.error as any)?.message || 'Không thể lấy video URL.';
                            updateVideo(videoId, { status: 'failed', progressMessage: `Lỗi: ${errorMessage}` });
                        }
                    } else {
                        setTimeout(() => poll(statusOperation), POLL_INTERVAL);
                    }
                } catch(pollError) {
                    console.error("Polling error:", pollError);
                    updateVideo(videoId, { status: 'failed', progressMessage: 'Lỗi khi kiểm tra trạng thái.' });
                }
            };
            
            setTimeout(() => poll(initialOperation), POLL_INTERVAL);

        } catch (err) {
            console.error(err);
            updateVideo(videoId, { status: 'failed', progressMessage: 'Lỗi khi bắt đầu tạo video.' });
        }
    }, [addVideo, updateVideo, videos]);

    const filteredPrompts = useMemo(() => {
        if (!selectedStoryId) return [];
        return prompts.filter(p => p.storyId === selectedStoryId);
    }, [prompts, selectedStoryId]);

    const handleGenerateAll = async () => {
        if (!filteredPrompts.length) return;
        setIsGeneratingAll(true);
        const generationPromises = filteredPrompts.map(prompt => handleGenerateVideo(prompt));
        await Promise.allSettled(generationPromises);
        setTimeout(() => setIsGeneratingAll(false), 1000); 
    };
    
    const getButtonState = (prompt: VideoPrompt): { text: string, disabled: boolean, showSpinner: boolean } => {
        const video = videos.find(v => v.promptId === prompt.id);
        if (!video) return { text: 'Tạo Video', disabled: false, showSpinner: false };
        switch(video.status) {
            case 'pending':
            case 'processing':
                return { text: 'Đang xử lý', disabled: true, showSpinner: true };
            case 'completed':
                return { text: 'Đã hoàn thành', disabled: true, showSpinner: false };
            case 'failed':
                return { text: 'Thử lại', disabled: false, showSpinner: false };
            default:
                return { text: 'Tạo Video', disabled: false, showSpinner: false };
        }
    }


    return (
        <div className="animate-fade-in text-light">
            <h1 className="text-3xl font-bold text-light mb-4">Tạo Video bằng Veo</h1>

            <div className="bg-secondary p-4 rounded-lg shadow-md mb-6 flex flex-col gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <label htmlFor="project-select" className="font-semibold text-dark-text">Chọn Project:</label>
                    <select
                        id="project-select"
                        value={selectedStoryId}
                        onChange={e => setSelectedStoryId(e.target.value)}
                        className="flex-grow p-2 bg-primary rounded-md border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none transition min-w-[200px]"
                    >
                        <option value="">-- Chờ tải danh sách --</option>
                        {stories.map(story => (
                            <option key={story.id} value={story.id}>{story.title}</option>
                        ))}
                    </select>
                    <button className="bg-primary hover:bg-gray-200 text-light font-bold py-2 px-4 rounded-lg transition-colors ml-auto whitespace-nowrap">
                        + Tạo Project Mới
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <label className="font-semibold text-dark-text">Model:</label>
                    <select disabled className="p-2 bg-primary rounded-md border border-gray-300 cursor-not-allowed text-gray-500">
                        <option>veo-2.0-generate-001</option>
                    </select>
                    <button
                        onClick={handleGenerateAll}
                        disabled={!selectedStoryId || isGeneratingAll}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isGeneratingAll && <Spinner className="w-4 h-4" />}
                        Chạy Tất Cả
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Prompts Column */}
                <div className="bg-secondary p-4 rounded-lg shadow-md flex flex-col">
                     <h2 className="text-xl font-bold text-light mb-4 border-b border-primary pb-2">Danh sách Prompt</h2>
                     <div className="flex-grow space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
                        {!selectedStoryId ? (
                            <div className="flex items-center justify-center h-full text-dark-text text-center p-4">
                                <p>Nhấn 'Tải danh sách' hoặc 'Tạo Project Mới' để bắt đầu...</p>
                            </div>
                        ) : filteredPrompts.length === 0 ? (
                             <div className="flex items-center justify-center h-full text-dark-text">
                                <p>Project này chưa có prompt nào.</p>
                            </div>
                        ) : (
                            filteredPrompts.map(prompt => {
                                const buttonState = getButtonState(prompt);
                                return (
                                    <div key={prompt.id} className="bg-primary p-3 rounded-lg shadow-inner flex flex-col justify-between">
                                        <p className="text-gray-700 text-sm mb-3">{prompt.prompt}</p>
                                        <button
                                            onClick={() => handleGenerateVideo(prompt)}
                                            disabled={buttonState.disabled}
                                            className="w-full bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                        >
                                            {buttonState.showSpinner && <Spinner className="w-4 h-4"/>}
                                            <span>{buttonState.text}</span>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                     </div>
                </div>

                {/* Videos Column */}
                <div className="bg-secondary p-4 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-bold text-light mb-4 border-b border-primary pb-2">Kết quả Video</h2>
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
                        {!selectedStoryId ? (
                             <div className="flex items-center justify-center h-full text-dark-text border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <p>Vui lòng chọn một project để bắt đầu</p>
                            </div>
                        ) : videos.filter(v => filteredPrompts.some(p => p.id === v.promptId)).length === 0 ? (
                            <div className="flex items-center justify-center h-full text-dark-text text-center p-4">
                               <p>Chưa có video nào được tạo cho project này.</p>
                           </div>
                        ) : (
                            videos
                                .filter(v => filteredPrompts.some(p => p.id === v.promptId))
                                .map(video => (
                                    <div key={video.id} className="bg-primary p-3 rounded-lg shadow-inner">
                                        <p className="text-gray-500 text-xs truncate mb-2" title={video.promptText}>{video.promptText}</p>
                                        {video.status === 'completed' && video.videoUrl ? (
                                            <video controls src={video.videoUrl} className="w-full rounded-md aspect-video bg-black"></video>
                                        ) : (
                                            <div className="w-full aspect-video bg-black rounded-md flex flex-col items-center justify-center text-center p-2">
                                                {video.status !== 'failed' && <Spinner className="w-6 h-6 mb-2" />}
                                                <p className="font-semibold capitalize text-white text-sm">{video.status}</p>
                                                <p className="text-gray-400 text-xs mt-1">{video.progressMessage}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateVideoView;
