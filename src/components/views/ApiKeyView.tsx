import React, { useState, useEffect } from 'react';
import { getApiKey, setApiKeyAndReloadClient } from '../../services/geminiService';
import { useToast } from '../../context/ToastContext';

interface ApiKeyViewProps {
    onKeySaved: () => void;
}

const ApiKeyView: React.FC<ApiKeyViewProps> = ({ onKeySaved }) => {
    const [currentKey, setCurrentKey] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        const existingKey = getApiKey();
        if (existingKey) {
            setCurrentKey(existingKey);
        }
    }, []);


    const handleSave = () => {
        if (currentKey.trim()) {
            setApiKeyAndReloadClient(currentKey.trim());
            showToast('API Key đã được lưu thành công!', 'success');
            onKeySaved();
        } else {
            showToast('Vui lòng nhập một API Key hợp lệ.', 'error');
        }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto pt-10">
            <h1 className="text-3xl font-bold text-light mb-2">Cài đặt API Key</h1>
            <p className="text-dark-text mb-6">
                Vui lòng nhập API Key Google Gemini của bạn để bắt đầu sử dụng ứng dụng.
            </p>

            <div className="bg-secondary p-6 rounded-lg shadow-md">
                <label htmlFor="api-key-input" className="block text-dark-text font-bold mb-2">
                    Google Gemini API Key
                </label>
                <input
                    id="api-key-input"
                    type="password"
                    value={currentKey}
                    onChange={(e) => setCurrentKey(e.target.value)}
                    placeholder="Dán API Key của bạn tại đây"
                    className="w-full p-3 bg-primary rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none transition"
                />
                <button
                    onClick={handleSave}
                    className="mt-4 w-full flex justify-center items-center bg-accent hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
                >
                    Lưu và Tiếp tục
                </button>
            </div>
            <div className="mt-6 text-center">
                 <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline"
                >
                    Không có API Key? Lấy một cái miễn phí tại đây.
                </a>
            </div>
        </div>
    );
};

export default ApiKeyView;