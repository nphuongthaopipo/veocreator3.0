import { UserCookie, LabsProject, Story, VideoPrompt } from './types'; // Thêm các kiểu dữ liệu

declare global {
  interface Window {
    electronAPI: {
      fetch: (url: string, cookie: UserCookie, options: RequestInit) => Promise<any>;
      // Cập nhật kiểu dữ liệu cho startBrowserAutomation
      startBrowserAutomation: (prompts: {id: string, text: string}[], cookie: UserCookie) => void;
      // Cập nhật kiểu dữ liệu cho onBrowserLog
      onBrowserLog: (callback: (log: {promptId: string, message: string, status?: 'running' | 'success' | 'error'}) => void) => () => void;
    };
  }
}

export {};