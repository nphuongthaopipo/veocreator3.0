import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { createVideoPrompts } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';
import Spinner from '../common/Spinner';

type ViewTab = 'create' | 'history';

const stylePills = [
    'Siêu thực', 'Phim', 'Hoạt hình Disney', 'Anime', 'Pixar', 'Truyện tranh', 'Noir', 'Cyberpunk',
    'Màu nước', 'Low-poly 3D', 'Cartoon 2D', 'Cartoon 3D', 'Disney', 'Pixel Art', 'Isometric',
    'Paper Cutout', 'Claymation'
];

const genres = [
    'Hành động/Chiến đấu', 'Tình cảm/Lãng mạn', 'Hài hước/Vui nhộn', 'Kinh dị/Horror',
    'Bí ẩn/Trinh thám', 'Fantasy/Thần thoại', 'Khoa học viễn tưởng', 'Drama/Chính kịch',
    'Giáo dục/Học tập', 'Phiêu lưu/Thám hiểm', 'Đời thường/Slice of Life', 'Trailer phim'
];

const CreatePromptsView: React.FC = () => {
    const { stories, prompts, addPrompts, deletePrompt } = useAppContext();
    const { showToast } = useToast();
    const [mainTab, setMainTab] = useState<ViewTab>('create');
    const [selectedStoryId, setSelectedStoryId] = useState('');
    const [granularity, setGranularity] = useState('detailed');
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [selectedGenre, setSelectedGenre] = useState(genres[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
    
    const [activeInputTab, setActiveInputTab] = useState<'select' | 'manual'>('select');
    const [manualStoryContent, setManualStoryContent] = useState('');

    const handleStyleToggle = (style: string) => {
        setSelectedStyles(prev =>
            prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let storyContent: string;
        let storyForPromptCreation: { id: string; title: string; content: string; };

        if (activeInputTab === 'select') {
            if (!selectedStoryId) {
                setError('Vui lòng chọn một câu chuyện.');
                return;
            }
            const story = stories.find(s => s.id === selectedStoryId);
            if (!story) {
                setError('Không tìm thấy câu chuyện.');
                setIsLoading(false);
                return;
            }
            storyContent = story.content;
            storyForPromptCreation = story;
        } else { // manual tab
            if (!manualStoryContent.trim()) {
                setError('Vui lòng nhập nội dung câu chuyện.');
                return;
            }
            storyContent = manualStoryContent;
            storyForPromptCreation = {
                id: `manual-${new Date().toISOString()}`,
                title: `Manual story: ${storyContent.substring(0, 30)}...`,
                content: storyContent
            };
        }

        setError('');
        setGeneratedPrompts([]);
        setIsLoading(true);

        const combinedStyle = [...selectedStyles, selectedGenre].join(', ');

        try {
            const response = await createVideoPrompts(storyContent, granularity, combinedStyle);
const parsedJson = JSON.parse(response.text ?? '{"prompts": []}');
            const promptsArray = parsedJson.prompts.map((p: { prompt: string }) => p.prompt);
            setGeneratedPrompts(promptsArray);
            const newPrompts = promptsArray.map((p: string) => ({
                id: `${storyForPromptCreation.id}-${new Date().getTime()}-${Math.random()}`,
                storyId: storyForPromptCreation.id,
                storyTitle: storyForPromptCreation.title,
                prompt: p
            }));
            addPrompts(newPrompts);
            showToast('Prompts đã được tạo thành công!', 'success');
        } catch (err) {
            console.error(err);
            setError('Không thể tạo prompts. Vui lòng kiểm tra định dạng phản hồi từ API.');
            showToast('Lỗi khi tạo prompts', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            showToast('Đã sao chép vào clipboard!', 'success');
        }, (err) => {
            showToast('Lỗi khi sao chép: ' + err, 'error');
        });
    };
    
    const renderCreateForm = () => (
        <>
            <div className="mb-6 flex border-b border-gray-300">
                <button type="button" onClick={() => setActiveInputTab('select')} className={`px-4 py-2 font-medium ${activeInputTab === 'select' ? 'text-accent border-b-2 border-accent' : 'text-dark-text'}`}>Chọn câu chuyện có sẵn</button>
                <button type="button" onClick={() => setActiveInputTab('manual')} className={`px-4 py-2 font-medium ${activeInputTab === 'manual' ? 'text-accent border-b-2 border-accent' : 'text-dark-text'}`}>Nhập thủ công</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {activeInputTab === 'select' && (
                    <div className="bg-secondary p-6 rounded-lg shadow-md">
                        <label className="block text-dark-text font-bold mb-2">Chọn câu chuyện</label>
                        <select value={selectedStoryId} onChange={e => setSelectedStoryId(e.target.value)} className="w-full p-3 bg-primary rounded-md border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none transition">
                            <option value="">-- Chọn một câu chuyện --</option>
                            {stories.map(story => (
                                <option key={story.id} value={story.id}>{story.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {activeInputTab === 'manual' && (
                     <div className="bg-secondary p-6 rounded-lg shadow-md">
                        <label className="block text-dark-text font-bold mb-2">💡 Ý tưởng câu chuyện</label>
                        <textarea 
                            value={manualStoryContent} 
                            onChange={e => setManualStoryContent(e.target.value)} 
                            placeholder="Mô tả ý tưởng của bạn... Ví dụ: Cậu bé và mẹ đi công viên, chơi đu quay, ăn kem, mặt trời lặn..." 
                            className="w-full h-32 p-3 bg-primary rounded-md border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none transition" 
                        />
                    </div>
                )}

                <div className="bg-secondary p-6 rounded-lg shadow-md space-y-4">
                    <div>
                        <label className="block text-dark-text font-bold mb-3">🎨 Style mẫu nhanh</label>
                        <div className="flex flex-wrap gap-2">
                            {stylePills.map(style => (
                                <button
                                    type="button"
                                    key={style}
                                    onClick={() => handleStyleToggle(style)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                        selectedStyles.includes(style)
                                            ? 'bg-accent text-white'
                                            : 'bg-primary hover:bg-gray-200 text-dark-text'
                                    }`}
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="genre-select" className="block text-dark-text font-bold mb-2">🎭 Thể loại câu chuyện</label>
                        <select id="genre-select" value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} className="w-full p-3 bg-primary rounded-md border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none transition">
                            {genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                        </select>
                    </div>
                </div>

                 <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <label className="block text-dark-text font-bold mb-2">Loại Prompt</label>
                    <select value={granularity} onChange={e => setGranularity(e.target.value)} className="w-full p-3 bg-primary rounded-md border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none transition">
                        <option value="detailed">Chi tiết (cho video 8 giây)</option>
                        <option value="all">Tổng hợp (cho toàn bộ câu chuyện)</option>
                    </select>
                </div>
                
                <div>
                    <button type="submit" disabled={isLoading || (activeInputTab === 'select' && stories.length === 0)} className="w-full flex justify-center items-center bg-accent hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? <><Spinner /> <span className="ml-2">Đang tạo...</span></> : 'Tạo Prompts'}
                    </button>
                    {activeInputTab === 'select' && stories.length === 0 && <p className="text-yellow-500 text-center mt-2">Bạn cần tạo một câu chuyện trước.</p>}
                </div>
            </form>
            
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            {generatedPrompts.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-light mb-4">Các Prompts đã tạo</h2>
                    <div className="space-y-4">
                        {generatedPrompts.map((prompt, index) => (
                            <div key={index} className="bg-secondary p-4 rounded-lg shadow">
                                <p className="text-gray-700">{prompt}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    const renderHistory = () => (
        <div className="space-y-3">
            {prompts.length === 0 ? <p className="text-dark-text text-center py-8">Chưa có prompt nào được tạo.</p> : (
                prompts.map(prompt => (
                    <div key={prompt.id} className="bg-secondary p-3 rounded-lg shadow flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-gray-700 text-sm">{prompt.prompt}</p>
                            <p className="text-xs text-dark-text mt-1 opacity-75">Từ: {prompt.storyTitle}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                             <button onClick={() => handleCopyToClipboard(prompt.prompt)} title="Sao chép" className="p-2 rounded-md hover:bg-gray-200 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                            <button onClick={() => deletePrompt(prompt.id)} title="Xóa" className="p-2 rounded-md hover:bg-red-100 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-light mb-2">Tạo Prompt Video</h1>
            <p className="text-dark-text mb-6">Tạo prompt từ câu chuyện có sẵn hoặc nhập thủ công.</p>
            
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         <button
                            onClick={() => setMainTab('create')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${mainTab === 'create'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'
                            }`}
                        >
                            Tạo Mới
                        </button>
                         <button
                            onClick={() => setMainTab('history')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${mainTab === 'history'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'
                            }`}
                        >
                            Lịch sử
                        </button>
                    </nav>
                </div>
            </div>

            {mainTab === 'create' ? renderCreateForm() : renderHistory()}
        </div>
    );
};

export default CreatePromptsView;