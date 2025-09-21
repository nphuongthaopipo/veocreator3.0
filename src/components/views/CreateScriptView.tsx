import React, { useState } from 'react';
import { processYouTubeVideo } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import Spinner from '../common/Spinner';

type ViewTab = 'create' | 'history';

const requestSuggestions = [
    "Lấy kịch bản đầy đủ của video.",
    "Tóm tắt video thành 5 gạch đầu dòng chính.",
    "Viết lại kịch bản thành một bài blog.",
    "Chuyển kịch bản sang phong cách hài hước.",
    "Phân tích các ý chính của video."
];

const CreateScriptView: React.FC = () => {
    const { youtubeScripts, addYouTubeScript, deleteYouTubeScript } = useAppContext();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<ViewTab>('create');
    const [url, setUrl] = useState('');
    const [request, setRequest] = useState(requestSuggestions[0]);
    const [generatedScript, setGeneratedScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusText, setStatusText] = useState('');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setGeneratedScript('');
        setIsLoading(true);

        if (!url.trim()) {
            setError('Vui lòng nhập URL YouTube.');
            setIsLoading(false);
            return;
        }

        try {
            setStatusText("Đang phân tích video và xử lý yêu cầu...");
            const response = await processYouTubeVideo(url, request);
            const scriptText = response.text ?? '';
            setGeneratedScript(scriptText);
            
            addYouTubeScript({
                id: new Date().toISOString(),
                sourceUrl: url,
                script: scriptText,
                request: request
            });
            showToast('Kịch bản đã được tạo thành công!', 'success');

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || 'Đã có lỗi xảy ra khi lấy kịch bản. Vui lòng thử lại.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
            setStatusText('');
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
            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <label htmlFor="youtube-url" className="block text-dark-text font-bold mb-2">URL Video YouTube</label>
                    <input id="youtube-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition" />
                </div>

                <div className="bg-secondary p-6 rounded-lg shadow-md">
                    <label htmlFor="request" className="block text-dark-text font-bold mb-2">Yêu cầu (Tùy chọn)</label>
                    <textarea id="request" value={request} onChange={e => setRequest(e.target.value)} placeholder="Ví dụ: Tóm tắt video thành 5 gạch đầu dòng." className="w-full h-24 p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition" />
                    <div className="flex flex-wrap gap-2 mt-3">
                        {requestSuggestions.map(suggestion => (
                            <button type="button" key={suggestion} onClick={() => setRequest(suggestion)} className="text-xs bg-primary hover:bg-hover-bg text-dark-text font-semibold py-1 px-3 rounded-full transition-colors">
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center bg-accent hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400">
                        {isLoading ? <><Spinner /> <span className="ml-2">{statusText || 'Đang xử lý...'}</span></> : 'Lấy kịch bản'}
                    </button>
                </div>
            </form>
            
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            {generatedScript && (
                <div className="mt-8 bg-secondary p-6 rounded-lg shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-light">Kết quả</h2>
                        <button onClick={() => handleCopyToClipboard(generatedScript)} className="bg-primary hover:bg-hover-bg text-dark-text font-bold py-2 px-4 rounded-lg transition-colors">
                            Sao chép
                        </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4 bg-primary rounded-md whitespace-pre-wrap text-dark-text">
                        {generatedScript}
                    </div>
                </div>
            )}
        </>
    );
    
    const renderHistory = () => (
         <div className="space-y-4">
            {youtubeScripts.length === 0 ? <p className="text-dark-text text-center py-8">Chưa có kịch bản nào được tạo.</p> : (
                youtubeScripts.map(item => (
                    <div key={item.id} className="bg-secondary p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                               <p className="text-sm text-dark-text font-medium">Từ URL: <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{item.sourceUrl}</a></p>
                               <p className="text-sm text-dark-text mt-1">Yêu cầu: {item.request}</p>
                               <p className="text-light mt-2 text-sm line-clamp-3">{item.script}</p>
                            </div>
                             <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleCopyToClipboard(item.script)} title="Sao chép" className="p-2 rounded-md hover:bg-hover-bg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                                <button onClick={() => deleteYouTubeScript(item.id)} title="Xóa" className="p-2 rounded-md hover:bg-red-100 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-light mb-2">Lấy kịch bản YouTube</h1>
            <p className="text-dark-text mb-6">Nhập URL video YouTube để lấy kịch bản, tóm tắt, hoặc thực hiện các yêu cầu khác.</p>

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
                           Tạo Mới
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

export default CreateScriptView;