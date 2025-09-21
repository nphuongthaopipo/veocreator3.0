const { app, BrowserWindow, screen: electronScreen, ipcMain } = require('electron');
const path = require('path');
const puppeteer = require('puppeteer');

// Hàm xử lý các yêu cầu API từ giao diện
async function handleApiRequest(_event, { url, cookie, options }) {
    try {
        const targetUrl = new URL(url);
        let headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            ...options.headers,
        };

        if (targetUrl.hostname === 'labs.google') {
            headers = {
                ...headers,
                'Accept': '*/*',
                'Cookie': cookie.value,
                'Origin': 'https://labs.google',
                'Referer': 'https://labs.google/',
                'X-Same-Domain': '1',
            };
        } else if (targetUrl.hostname === 'aisandbox-pa.googleapis.com') {
            if (!cookie.bearerToken) {
                throw new Error("Bearer Token is required for video generation but not found in the active cookie.");
            }
            headers = {
                ...headers,
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${cookie.bearerToken}`,
                'Cookie': cookie.value,
                'Origin': 'https://labs.google',
                'Referer': 'https://labs.google/',
            };
        }
        
        const body = typeof options.body === 'object' ? JSON.stringify(options.body) : options.body;
        const response = await fetch(url, { ...options, headers, body });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
            throw new Error(`API request to ${url} failed with status ${response.status}`);
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : {};

    } catch (error) {
        console.error(`Failed to fetch ${url}`, error);
        throw new Error(error.message || 'An unknown network error occurred.');
    }
}

// Logic tự động hóa trình duyệt bằng Puppeteer
ipcMain.on('browser:start-automation', async (event, { prompts, cookie }) => {
    const mainWindow = BrowserWindow.fromWebContents(event.sender);
    
    const sendLog = (promptId, message, status) => {
        if (mainWindow) {
            mainWindow.webContents.send('browser:log', { promptId, message, status });
        }
        console.log(`[${promptId || 'general'}] ${message}`);
    };

    let browser = null;
    const firstPromptId = prompts[0]?.id || 'automation-task';

    try {
        sendLog(firstPromptId, 'Khởi chạy trình duyệt...', 'running');
        browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
        const page = (await browser.pages())[0];

        sendLog(firstPromptId, 'Thiết lập cookie đăng nhập...', 'running');
        
        // [SỬA LỖI] Logic phân tích cookie mới, an toàn hơn
        const cookieObjects = cookie.value.split(';')
            .map(pair => {
                const i = pair.indexOf('=');
                if (i < 0) {
                    return null;
                }
                const name = pair.slice(0, i).trim();
                const value = pair.slice(i + 1).trim();
                if (!name) { // Bỏ qua nếu tên cookie rỗng
                    return null;
                }
                return { name, value, domain: '.google.com' };
            })
            .filter(c => c !== null); // Lọc bỏ các cookie không hợp lệ

        if (cookieObjects.length === 0) {
            throw new Error('Không tìm thấy cookie hợp lệ nào trong chuỗi được cung cấp.');
        }

        await page.setCookie(...cookieObjects);

        sendLog(firstPromptId, 'Truy cập trang Veo...', 'running');
        await page.goto('https://labs.google/fx/vi/tools/flow', { waitUntil: 'networkidle2' });
        
        const promptInputSelector = 'textarea[aria-label="Nhập ở vào ở đây hoặc nhập lệnh để bắt đầu"]';
        await page.waitForSelector(promptInputSelector, { timeout: 60000 });

        for (const prompt of prompts) {
            try {
                sendLog(prompt.id, 'Bắt đầu xử lý prompt...', 'running');
                await page.type(promptInputSelector, prompt.text, { delay: 20 });
                
                const generateButtonSelector = 'button[aria-label="Tạo video"]';
                await page.waitForSelector(generateButtonSelector, { visible: true });
                await page.click(generateButtonSelector);
                
                sendLog(prompt.id, 'Đã gửi yêu cầu, đang chờ video được tạo...', 'running');
                
                await page.waitForSelector(generateButtonSelector, { timeout: 300000 });
                
                sendLog(prompt.id, 'Video đã hoàn thành!', 'success');

                await page.click(promptInputSelector, { clickCount: 3 });
                await page.keyboard.press('Backspace');
                await page.waitForTimeout(500);

            } catch (promptError) {
                 sendLog(prompt.id, `Lỗi khi xử lý prompt: ${promptError.message}`, 'error');
            }
        }

    } catch (error) {
        const errorMessage = `Lỗi nghiêm trọng: ${error.message}`;
        if (prompts && prompts.length > 0) {
            prompts.forEach(p => sendLog(p.id, errorMessage, 'error'));
        } else {
             sendLog(null, errorMessage, 'error');
        }
    } finally {
        if (browser) {
            setTimeout(() => browser.close(), 120000); 
        }
    }
});

// Hàm tạo cửa sổ chính của ứng dụng
function createWindow() {
  const primaryDisplay = electronScreen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

// Vòng đời của ứng dụng Electron
app.whenReady().then(() => {
    ipcMain.handle('fetch-api', handleApiRequest);
    createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});