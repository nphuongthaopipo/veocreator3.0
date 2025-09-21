import React from 'react';

const UserInfo: React.FC = () => {
    return (
        <div className="p-4 border-t border-gray-200 mt-4">
            <div className="flex items-center">
                <img src="https://picsum.photos/40/40" alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
                <div>
                    <p className="font-semibold text-light">Demo User</p>
                    <p className="text-sm text-dark-text">Gói: Pro</p>
                </div>
            </div>
            <button className="w-full mt-4 bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Nâng Cấp
            </button>
        </div>
    );
};

export default UserInfo;