import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { createThumbnailPrompt, generateThumbnailImage } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';
import Spinner from '../common/Spinner';

type MainViewTab = 'create' | 'history';
type CreateModeTab = 'story' | 'manual';

const styleSuggestions = [
    "Điện ảnh", "Phim hoạt hình 3D", "Nghệ thuật Fantasy", "Anime", "Màu nước", "Nghệ thuật điểm ảnh",
    "Nhiếp ảnh", "Siêu thực", "Tối giản", "Vaporwave", "Cyberpunk", "Steampunk"
];

const aspectRatioSuggestions = [
    { label: '16:9 (Ngang)', value: 'tỷ lệ 16:9' },
    { label: '1:1 (Vuông)', value: 'tỷ lệ 1:1' },
    { label: '9:16 (Dọc)', value: 'tỷ lệ 9:16' }
];

const CreateThumbnailView: React.FC = () => {
    const { stories, thumbnails, addThumbnail, deleteThumbnail } = useAppContext();
    const { showToast } = useToast();
    
    const [activeMainTab, setActiveMainTab] = useState<MainViewTab>('create');
    const [activeCreateTab, setActiveCreateTab] = useState<CreateModeTab>('story');
    const [selectedStoryId, setSelectedStoryId] = useState('');
    const [manualPrompt, setManualPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedImage, setGeneratedImage] = useState('');
    const [statusText, setStatusText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setGeneratedImage('');
        setIsLoading(true);

        let finalPrompt: string | undefined;
        let storyForThumbnail = { id: `manual-${Date.now()}`, title: 'Manual Prompt' };

        try {
            if (activeCreateTab === 'story') {
                if (!selectedStoryId) throw new Error('Vui lòng chọn một câu chuyện.');
                const story = stories.find(s => s.id === selectedStoryId);
                if (!story) throw new Error('Không tìm thấy câu chuyện.');
                storyForThumbnail = story;
                setStatusText('Đang tạo prompt cho ảnh...');
                const promptResponse = await createThumbnailPrompt(story.content);
                finalPrompt = promptResponse.text;
            } else {
                if (!manualPrompt.trim()) throw new Error('Vui lòng nhập prompt để tạo ảnh.');
                finalPrompt = manualPrompt;
            }
            
            if (!finalPrompt) throw new Error('Không thể tạo prompt.');

            setStatusText('Đang tạo ảnh thumbnail...');
            // SỬA LỖI: Chỉ truyền 1 tham số
            const imageUrl = await generateThumbnailImage(finalPrompt);
            
            setGeneratedImage(imageUrl);
            addThumbnail({
                id: new Date().toISOString(),
                storyId: storyForThumbnail.id,
                storyTitle: storyForThumbnail.title,
                imageUrl: imageUrl,
            });
            showToast('Tạo thumbnail thành công!', 'success');

        } catch (err: any) {
            const errorMessage = err.message || 'Đã xảy ra lỗi khi tạo thumbnail.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderHistory = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {thumbnails.length === 0 ? (
                <p className="text-dark-text col-span-full text-center py-8">Chưa có thumbnail nào được tạo.</p>
            ) : (
                thumbnails.map(thumb => (
                    <div key={thumb.id} className="bg-secondary rounded-lg shadow overflow-hidden group relative transition-shadow hover:shadow-xl">
                        <button 
                            onClick={() => deleteThumbnail(thumb.id)}
                            className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Xóa ảnh"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img src={thumb.imageUrl} alt={thumb.storyTitle} className="w-full h-auto object-cover aspect-video" />
                        <div className="p-2">
                           <p className="text-xs text-dark-text truncate" title={thumb.storyTitle}>Từ: {thumb.storyTitle}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
    
    const renderCreateForm = () => {
        const addToPrompt = (textToAdd: string) => {
            setManualPrompt(prev => `${prev}${prev.trim() ? ', ' : ''}${textToAdd}`);
        };

        return (
            <>
                <div className="mb-6">
                    <div className="border-b border-border-color">
                        <nav className="-mb-px flex space-x-6" aria-label="Create Tabs">
                             <button
                                onClick={() => setActiveCreateTab('story')}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeCreateTab === 'story' ? 'border-accent text-accent' : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'}`}
                            >
                               Tạo theo câu chuyện
                            </button>
                             <button
                                onClick={() => setActiveCreateTab('manual')}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeCreateTab === 'manual' ? 'border-accent text-accent' : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'}`}
                            >
                                Tạo thủ công
                            </button>
                        </nav>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {activeCreateTab === 'story' ? (
                         <div className="bg-secondary p-6 rounded-lg shadow-md">
                            <label className="block text-dark-text font-bold mb-2">Chọn câu chuyện</label>
                            <select 
                                value={selectedStoryId} 
                                onChange={e => setSelectedStoryId(e.target.value)} 
                                className="w-full p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition"
                                disabled={stories.length === 0}
                            >
                                <option value="">{stories.length > 0 ? '-- Chọn một câu chuyện --' : 'Không có câu chuyện nào'}</option>
                                {stories.map(story => (
                                    <option key={story.id} value={story.id}>{story.title}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="bg-secondary p-6 rounded-lg shadow-md">
                            <label htmlFor="manual-prompt" className="block text-dark-text font-bold mb-2">Prompt tạo ảnh</label>
                            <textarea 
                                id="manual-prompt"
                                value={manualPrompt} 
                                onChange={e => setManualPrompt(e.target.value)} 
                                placeholder="Ví dụ: một phi hành gia đang cưỡi một con rồng vũ trụ, phong cách điện ảnh..."
                                className="w-full h-32 p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition"
                            />
                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-sm text-dark-text mb-2">Gợi ý kích thước:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {aspectRatioSuggestions.map(aspect => (
                                            <button
                                                type="button"
                                                key={aspect.value}
                                                onClick={() => addToPrompt(aspect.value)}
                                                className="text-xs bg-primary hover:bg-hover-bg text-dark-text font-semibold py-1 px-3 rounded-full transition-colors"
                                            >
                                               + {aspect.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-dark-text mb-2">Gợi ý phong cách:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {styleSuggestions.map(style => (
                                            <button
                                                type="button"
                                                key={style}
                                                onClick={() => addToPrompt(`phong cách ${style}`)}
                                                className="text-xs bg-primary hover:bg-hover-bg text-dark-text font-semibold py-1 px-3 rounded-full transition-colors"
                                            >
                                               + {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <button 
                            type="submit" 
                            disabled={isLoading || (activeCreateTab === 'story' && stories.length === 0)} 
                            className="w-full flex justify-center items-center bg-accent hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <><Spinner /> <span className="ml-2">{statusText || 'Đang tạo...'}</span></> : 'Tạo Thumbnail'}
                        </button>
                        {activeCreateTab === 'story' && stories.length === 0 && <p className="text-yellow-500 text-center mt-2">Bạn cần tạo một câu chuyện trước.</p>}
                    </div>
                </form>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                {generatedImage && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-light mb-4">Thumbnail đã tạo</h2>
                        <div className="bg-secondary p-4 rounded-lg shadow-inner flex justify-center">
                            <img src={generatedImage} alt="Generated Thumbnail" className="max-w-full lg:max-w-2xl rounded-md" />
                        </div>
                    </div>
                )}
            </>
        )
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-light mb-2">Tạo Ảnh Thumbnail</h1>
            <p className="text-dark-text mb-6">Tạo thumbnail hấp dẫn từ câu chuyện hoặc từ prompt của bạn.</p>
            <div className="mb-6">
                <div className="border-b border-border-color">
                    <nav className="-mb-px flex space-x-6" aria-label="Main Tabs">
                         <button
                            onClick={() => setActiveMainTab('create')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeMainTab === 'create' ? 'border-accent text-accent' : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'}`}
                        >
                           Tạo Mới
                        </button>
                         <button
                            onClick={() => setActiveMainTab('history')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeMainTab === 'history' ? 'border-accent text-accent' : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'}`}
                        >
                            Lịch sử ({thumbnails.length})
                        </button>
                    </nav>
                </div>
            </div>
            {activeMainTab === 'create' ? renderCreateForm() : renderHistory()}
        </div>
    );
};

export default CreateThumbnailView;