import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { createStoryFromText, createVideoPrompts, createThumbnailPrompt, generateThumbnailImage } from '../../services/geminiService';
import Spinner from '../common/Spinner';
import { Story, VideoPrompt, GeneratedImage } from '../../types';

type Step = 'idle' | 'story' | 'prompts' | 'thumbnail' | 'done' | 'error';

const AutoCreateView: React.FC = () => {
    const { addStory, addPrompts, addThumbnail } = useAppContext();
    const [source, setSource] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<Step>('idle');
    const [error, setError] = useState('');
    
    const [resultStory, setResultStory] = useState<Story | null>(null);
    const [resultPrompts, setResultPrompts] = useState<VideoPrompt[]>([]);
    const [resultThumbnail, setResultThumbnail] = useState<GeneratedImage | null>(null);

    const resetState = () => {
        setIsLoading(false);
        setCurrentStep('idle');
        setError('');
        setResultStory(null);
        setResultPrompts([]);
        setResultThumbnail(null);
    }

    const runAutoFlow = async () => {
        if (!source.trim()) {
            setError('Vui lòng nhập ý tưởng hoặc liên kết.');
            return;
        }
        resetState();
        setIsLoading(true);

        try {
            // Step 1: Create Story
            setCurrentStep('story');
            const storyResponse = await createStoryFromText(source, '1000', 'Kể chuyện');
            const story: Story = {
                id: new Date().toISOString(),
                title: `Auto-Story: ${source.substring(0, 30)}...`,
                content: storyResponse.text ?? '', // Sửa lỗi 1
                source: source
            };
            addStory(story);
            setResultStory(story);

            // Step 2: Create Prompts
            setCurrentStep('prompts');
            const promptsResponse = await createVideoPrompts(story.content, 'detailed', 'Hoạt hình');
            // Sửa lỗi 2
            const parsedJson = JSON.parse(promptsResponse.text ?? '{"prompts": []}'); 
            const promptsArray = parsedJson.prompts.map((p: { prompt: string }) => p.prompt);
            const newPrompts: VideoPrompt[] = promptsArray.map((p: string, i:number) => ({
                id: `${story.id}-prompt-${i}`,
                storyId: story.id,
                storyTitle: story.title,
                prompt: p
            }));
            addPrompts(newPrompts);
            setResultPrompts(newPrompts);
            
            // Step 3: Create Thumbnail
            setCurrentStep('thumbnail');
            const thumbPromptResponse = await createThumbnailPrompt(story.content);
            // Sửa lỗi 3: Chỉ truyền 1 tham số
            const imageUrl = await generateThumbnailImage(thumbPromptResponse.text ?? ''); 
            const newThumbnail: GeneratedImage = {
                id: `${story.id}-thumb`,
                storyId: story.id,
                storyTitle: story.title,
                imageUrl: imageUrl,
            }
            addThumbnail(newThumbnail);
            setResultThumbnail(newThumbnail);

            setCurrentStep('done');
        } catch (err) {
            console.error(err);
            setError('Quy trình tự động đã gặp lỗi. Vui lòng thử lại.');
            setCurrentStep('error');
        } finally {
            setIsLoading(false);
        }
    };

    const getStepClass = (step: Step) => {
        if(currentStep === 'error' && step !== 'idle') return 'bg-red-500/20 text-red-600';
        if(currentStep === step && isLoading) return 'animate-pulse-fast bg-accent/30 text-accent';
        if(currentStep === 'done' || (currentStep !== 'idle' && stepOrder.indexOf(step) < stepOrder.indexOf(currentStep))) return 'bg-green-500/20 text-green-700';
        return 'bg-secondary text-dark-text';
    };
    
    const stepOrder: Step[] = ['story', 'prompts', 'thumbnail', 'done'];


    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-light mb-2">Tạo Tự Động</h1>
            <p className="text-dark-text mb-6">Nhập một ý tưởng và hệ thống sẽ tự động tạo câu chuyện, prompts, và thumbnail.</p>

            <div className="bg-secondary p-6 rounded-lg shadow-md">
                <label className="block text-dark-text font-bold mb-2">Yêu cầu ban đầu</label>
                <textarea value={source} onChange={e => setSource(e.target.value)} placeholder="Nhập ý tưởng của bạn ở đây..." className="w-full h-24 p-3 bg-primary rounded-md border border-gray-300 focus:ring-2 focus:ring-accent focus:outline-none transition" />
                <button onClick={runAutoFlow} disabled={isLoading} className="mt-4 w-full flex justify-center items-center bg-accent hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400">
                     {isLoading ? <><Spinner /> <span className="ml-2">Đang xử lý...</span></> : 'Chạy quy trình tự động'}
                </button>
            </div>
            
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            {(currentStep !== 'idle') && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-light mb-4">Tiến trình</h2>
                    <div className="space-y-3">
                       <div className={`p-4 rounded-lg transition-all ${getStepClass('story')}`}>1. Tạo câu chuyện...</div>
                       <div className={`p-4 rounded-lg transition-all ${getStepClass('prompts')}`}>2. Tạo prompts video...</div>
                       <div className={`p-4 rounded-lg transition-all ${getStepClass('thumbnail')}`}>3. Tạo ảnh thumbnail...</div>
                    </div>
                </div>
            )}

            {currentStep === 'done' && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-light mb-4">Kết quả</h2>
                     <div className="space-y-6">
                        {resultStory && (
                            <div>
                                <h3 className="text-xl font-semibold text-accent mb-2">Câu chuyện</h3>
                                <div className="bg-secondary p-4 rounded-lg max-h-48 overflow-y-auto text-gray-700 whitespace-pre-wrap">{resultStory.content}</div>
                            </div>
                        )}
                        {resultThumbnail && (
                             <div>
                                <h3 className="text-xl font-semibold text-accent mb-2">Thumbnail</h3>
                                <img src={resultThumbnail.imageUrl} alt="Generated Thumbnail" className="max-w-sm rounded-lg mx-auto" />
                            </div>
                        )}
                        {resultPrompts.length > 0 && (
                             <div>
                                <h3 className="text-xl font-semibold text-accent mb-2">Prompts</h3>
                                <div className="bg-secondary p-4 rounded-lg max-h-48 overflow-y-auto space-y-2">
                                    {resultPrompts.map(p => <p key={p.id} className="text-gray-700 bg-primary p-2 rounded">{p.prompt}</p>)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoCreateView;