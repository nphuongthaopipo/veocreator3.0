import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

type HistoryTab = 'stories' | 'thumbnails' | 'videos' | 'prompts';

const HistoryView: React.FC = () => {
    const { stories, prompts, thumbnails, videos } = useAppContext();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<HistoryTab>('stories');

    const handleCopyToClipboard = (content: string, type: string) => {
        navigator.clipboard.writeText(content).then(() => {
            showToast(`Đã sao chép ${type}!`, 'success');
        }, (err) => {
            showToast(`Lỗi khi sao chép: ${err}`, 'error');
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'stories':
                return (
                    <div>
                        {stories.length === 0 ? <p className="text-dark-text">Chưa có câu chuyện nào.</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stories.map(story => (
                                    <div key={story.id} className="bg-secondary p-4 rounded-lg shadow hover:shadow-xl transition-shadow flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-light truncate">{story.title}</h3>
                                            <p className="text-gray-500 text-sm mt-2 h-20 overflow-hidden text-ellipsis">{story.content}</p>
                                        </div>
                                        <button onClick={() => handleCopyToClipboard(story.content, 'câu chuyện')} className="mt-4 text-sm bg-primary hover:bg-gray-200 text-dark-text font-semibold py-1.5 px-3 rounded-lg self-start transition-colors">Sao chép nội dung</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'thumbnails':
                return (
                    <div>
                        {thumbnails.length === 0 ? <p className="text-dark-text">Chưa có thumbnail nào.</p> : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {thumbnails.map(thumb => (
                                    <div key={thumb.id} className="bg-secondary rounded-lg shadow overflow-hidden">
                                        <img src={thumb.imageUrl} alt={thumb.storyTitle} className="w-full h-auto object-cover" />
                                        <p className="text-xs text-dark-text p-2 truncate">{thumb.storyTitle}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'videos':
                return (
                    <div>
                        {videos.length === 0 ? <p className="text-dark-text">Chưa có video nào.</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {videos.map(video => (
                                    <div key={video.id} className="bg-secondary p-4 rounded-lg shadow">
                                        {video.status === 'completed' && video.videoUrl ? (
                                            <video controls src={video.videoUrl} className="w-full rounded-md"></video>
                                        ) : (
                                            <div className="w-full aspect-video bg-primary rounded-md flex items-center justify-center">
                                                <p className="text-dark-text">Video đang xử lý...</p>
                                            </div>
                                        )}
                                        <p className="text-gray-500 text-sm mt-2 truncate">{video.promptText}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'prompts':
                 return (
                    <div>
                        {prompts.length === 0 ? <p className="text-dark-text">Chưa có prompt nào.</p> : (
                            <div className="space-y-3">
                                {prompts.map(prompt => (
                                    <div key={prompt.id} className="bg-secondary p-3 rounded-lg shadow flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-700">{prompt.prompt}</p>
                                            <p className="text-xs text-dark-text mt-1">Từ: {prompt.storyTitle}</p>
                                        </div>
                                        <button onClick={() => handleCopyToClipboard(prompt.prompt, 'prompt')} className="ml-4 text-sm bg-primary hover:bg-gray-200 text-dark-text font-semibold py-1.5 px-3 rounded-lg self-start transition-colors flex-shrink-0">Sao chép</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    }

    const tabs: { id: HistoryTab; label: string; count: number }[] = [
        { id: 'stories', label: 'Câu chuyện', count: stories.length },
        { id: 'thumbnails', label: 'Thumbnails', count: thumbnails.length },
        { id: 'videos', label: 'Videos', count: videos.length },
        { id: 'prompts', label: 'Prompts Video', count: prompts.length },
    ];

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-light mb-2">Lịch sử Tạo</h1>
            <p className="text-dark-text mb-6">Xem lại tất cả nội dung bạn đã tạo.</p>

            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-accent text-accent'
                                    : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'
                                }`}
                            >
                                {tab.label} <span className={`ml-1.5 rounded-full py-0.5 px-2 text-xs font-semibold ${activeTab === tab.id ? 'bg-accent/20 text-accent' : 'bg-primary text-dark-text'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default HistoryView;