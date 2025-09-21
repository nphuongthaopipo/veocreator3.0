const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    fetch: (url, cookie, options) => 
        ipcRenderer.invoke('fetch-api', { url, cookie, options }),
    
    // Cập nhật để gửi đi đúng dữ liệu
    startBrowserAutomation: (prompts, cookie) => 
        ipcRenderer.send('browser:start-automation', { prompts, cookie }),
    
    onBrowserLog: (callback) => {
        // Thay đổi listener để nhận đúng object log
        const listener = (_event, log) => callback(log);
        ipcRenderer.on('browser:log', listener);
        return () => ipcRenderer.removeListener('browser:log', listener);
    }
});