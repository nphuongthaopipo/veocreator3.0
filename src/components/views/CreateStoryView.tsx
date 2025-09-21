import React, { useState, useEffect } from 'react';
import { createStoryFromText, createStoryFromUrl } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../common/Spinner';
import { Story } from '../../types';

type InputType = 'idea' | 'url';
type ViewTab = 'create' | 'history';

const storyGenres = [
    'Kể chuyện',
    'Hành động/Chiến đấu',
    'Tình cảm/Lãng mạn',
    'Hài hước/Vui nhộn',
    'Kinh dị/Horror',
    'Bí ẩn/Trinh thám',
    'Fantasy/Thần thoại',
    'Khoa học viễn tưởng',
    'Drama/Chính kịch',
    'Giáo dục/Học tập',
    'Phiêu lưu/Thám hiểm',
    'Đời thường/Slice of Life',
    'Trailer phim',
    'Phát triển dựa trên nội dung gốc'
];

const CreateStoryView: React.FC = () => {
    const { stories, addStory, updateStory, deleteStory } = useAppContext();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ViewTab>('create');
    const [inputType, setInputType] = useState<InputType>('idea');
    const [source, setSource] = useState('');
    const [wordCount, setWordCount] = useState('5000');
    const [customWordCount, setCustomWordCount] = useState('');
    const [style, setStyle] = useState(storyGenres[0]);
    const [generatedStory, setGeneratedStory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingStory, setEditingStory] = useState<Story | null>(null);

    useEffect(() => {
        if (editingStory) {
            setSource(editingStory.source);
            setGeneratedStory(editingStory.content);
        } else {
            // Reset form when not editing
            setSource('');
            setGeneratedStory('');
        }
    }, [editingStory]);


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!editingStory) setGeneratedStory('');
        setIsLoading(true);

        const finalWordCount = wordCount === 'custom' ? customWordCount : wordCount;
        if (!source.trim() || !finalWordCount.trim()) {
            setError('Vui lòng nhập đủ thông tin.');
            setIsLoading(false);
            return;
        }

        try {
            const response = inputType === 'idea'
                ? await createStoryFromText(source, finalWordCount, style)
                : await createStoryFromUrl(source, finalWordCount, style);

            const storyText = response.text ?? '';
            setGeneratedStory(storyText);

            if(editingStory) {
                 updateStory(editingStory.id, {
                    content: storyText,
                    source: source,
                    title: `(Edited) Story from ${inputType}: ${source.substring(0, 20)}...`
                 });
                 showToast('Câu chuyện đã được cập nhật!', 'success');
                 setEditingStory(null);
            } else {
                addStory({
                    id: new Date().toISOString(),
                    title: `Story from ${inputType}: ${source.substring(0, 30)}...`,
                    content: storyText,
                    source: source
                });
                showToast('Câu chuyện đã được tạo thành công!', 'success');
            }

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || 'Đã có lỗi xảy ra khi tạo câu chuyện. Vui lòng thử lại.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEdit = (story: Story) => {
        setEditingStory(story);
        setActiveTab('create');
    }

    const handleCopyToClipboard = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            showToast('Đã sao chép vào clipboard!', 'success');
        }, (err) => {
            showToast('Lỗi khi sao chép: ' + err, 'error');
        });
    };

    const wordCountOptions = [
        { value: '5000', label: '5000 từ (~25 phút đọc)' },
        { value: '10000', label: '10000 từ (~50 phút đọc)' },
        { value: '30000', label: '30000 từ (~150 phút đọc)' },
    ];

    const renderCreateForm = () => (
        <>
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 bg-secondary p-6 rounded-lg shadow-md">
                     <div className="flex justify-between items-center mb-4">
                        <div className="flex border-b border-border-color">
                            <button type="button" onClick={() => setInputType('idea')} className={`px-4 py-2 font-medium ${inputType === 'idea' ? 'text-accent border-b-2 border-accent' : 'text-dark-text'}`}>Nhập ý tưởng</button>
                            <button type="button" onClick={() => setInputType('url')} className={`px-4 py-2 font-medium ${inputType === 'url' ? 'text-accent border-b-2 border-accent' : 'text-dark-text'}`}>Nhập liên kết bài báo</button>
                        </div>
                        {editingStory && <button type="button" onClick={() => setEditingStory(null)} className="text-sm bg-gray-200 hover:bg-gray-300 text-dark-text font-semibold py-1 px-3 rounded-lg">Hủy Chỉnh sửa</button>}
                    </div>
                    {inputType === 'idea' ? (
                         <textarea value={source} onChange={e => setSource(e.target.value)} placeholder="Ví dụ: một phi hành gia bị lạc trên sao Hỏa..." className="w-full h-32 p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition" />
                    ) : (
                         <input type="url" value={source} onChange={e => setSource(e.target.value)} placeholder="https://example.com/article" className="w-full p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition" />
                    )}
                </div>

                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <label className="block text-dark-text font-bold mb-2">Độ dài</label>
                    <select value={wordCount} onChange={e => setWordCount(e.target.value)} className="w-full p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition">
                         {wordCountOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                         <option value="custom">Tùy chọn...</option>
                    </select>
                    {wordCount === 'custom' && (
                        <input type="number" value={customWordCount} onChange={e => setCustomWordCount(e.target.value)} placeholder="Nhập số từ" className="w-full p-3 mt-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition" />
                    )}
                </div>

                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <label className="block text-dark-text font-bold mb-2">Phong cách</label>
                    <select value={style} onChange={e => setStyle(e.target.value)} className="w-full p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition">
                        {storyGenres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                    </select>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center bg-accent hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400">
                        {isLoading ? <><Spinner /> <span className="ml-2">{editingStory ? 'Đang cập nhật...' : 'Đang tạo...'}</span></> : (editingStory ? 'Cập nhật Câu chuyện' : 'Tạo câu chuyện')}
                    </button>
                </div>
            </form>
            
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            {generatedStory && (
                <div className="mt-8 bg-secondary p-6 rounded-lg shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-light">Kết quả</h2>
                        <button onClick={() => handleCopyToClipboard(generatedStory)} className="bg-primary hover:bg-hover-bg text-dark-text font-bold py-2 px-4 rounded-lg transition-colors">
                            Sao chép
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4 bg-primary rounded-md whitespace-pre-wrap text-dark-text">
                        {generatedStory}
                    </div>
                </div>
            )}
        </>
    );
    
    const renderHistory = () => (
         <div className="space-y-4">
            {stories.length === 0 ? <p className="text-dark-text text-center py-8">Chưa có câu chuyện nào được tạo.</p> : (
                stories.map(story => (
                    <div key={story.id} className="bg-secondary p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                           <h3 className="font-bold text-light">{story.title}</h3>
                           <p className="text-sm text-dark-text mt-1 line-clamp-2">{story.content}</p>
                        </div>
                         <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => handleCopyToClipboard(story.content)} title="Sao chép" className="p-2 rounded-md hover:bg-hover-bg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                            <button onClick={() => handleEdit(story)} title="Sửa" className="p-2 rounded-md hover:bg-hover-bg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                            <button onClick={() => deleteStory(story.id)} title="Xóa" className="p-2 rounded-md hover:bg-red-100 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-light mb-2">Tạo Câu chuyện</h1>
            <p className="text-dark-text mb-6">Bắt đầu bằng một liên kết bài báo hoặc một ý tưởng của riêng bạn.</p>

             <div className="mb-6">
                <div className="border-b border-border-color">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         <button
                            onClick={() => setActiveTab('create')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'create'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'
                            }`}
                        >
                            {editingStory ? 'Chỉnh sửa câu chuyện' : 'Tạo Mới'}
                        </button>
                         <button
                            onClick={() => setActiveTab('history')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                            ${activeTab === 'history'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-dark-text hover:text-light hover:border-gray-300'
                            }`}
                        >
                            Lịch sử
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'create' ? renderCreateForm() : renderHistory()}
            
        </div>
    );
};

export default CreateStoryView;