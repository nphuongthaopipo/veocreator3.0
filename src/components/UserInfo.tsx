import React from 'react';

interface UserInfoProps {
    isCollapsed: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({ isCollapsed }) => {
    // Nếu sidebar bị thu gọn, chỉ hiển thị một icon
    if (isCollapsed) {
        return (
            <div className="p-4 border-t border-gray-200 mt-4 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center" title="Demo User">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>
            </div>
        );
    }
    
    // Giao diện đầy đủ khi sidebar mở rộng
    return (
        <div className="p-4 border-t border-gray-200 mt-4">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>
                <div>
                    <p className="font-semibold text-light whitespace-nowrap">Demo User</p>
                    <p className="text-sm text-dark-text whitespace-nowrap">Gói: Pro</p>
                </div>
            </div>
            <button className="w-full mt-4 bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap">
                Nâng Cấp
            </button>
        </div>
    );
};

export default UserInfo;