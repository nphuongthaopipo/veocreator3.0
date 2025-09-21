import { UserCookie } from '../types';

const VEO_API_BASE_URL = 'https://aisandbox-pa.googleapis.com/v1';

async function fetchViaMain(url: string, cookie: UserCookie, options: RequestInit = {}): Promise<any> {
    if (!window.electronAPI) {
        throw new Error('Electron API is not available. Ensure preload script is configured correctly.');
    }
    return window.electronAPI.fetch(url, cookie, options);
}

const activateProjectSession = async (cookie: UserCookie, projectId: string): Promise<void> => {
    const nextDataId = 'F62GRMHSULGakdozzVitoIs'; 
    const url = `https://labs.google/fx/next/data/${nextDataId}/flow/project/${projectId}.json?projectId=${projectId}`;
    try {
        await fetchViaMain(url, cookie, { method: 'GET' });
    } catch (error) {
        console.warn(`Could not activate project session:`, error);
    }
};

export const createLabsProject = async (cookie: UserCookie): Promise<{ projectId: string; projectName: string }> => {
    const url = `https://labs.google/fx/api/trpc/project.createProject`;
    const projectTitle = `Veo Project - ${new Date().toLocaleString()}`;
    const requestBody = { json: { projectTitle, toolName: "PINHOLE" } };

    const response = await fetchViaMain(url, cookie, {
        method: 'POST',
        body: JSON.stringify(requestBody),
    });
    
    const resultData = response?.result?.data?.json?.result;
    const projectId = resultData?.projectId;
    const projectName = resultData?.projectInfo?.projectTitle;

    if (!projectId || !projectName) {
        throw new Error('Failed to create project or parse response.');
    }
    await activateProjectSession(cookie, projectId);
    return { projectId, projectName };
};

export const generateVeoVideo = async (
    cookie: UserCookie,
    projectId: string,
    prompt: string,
    aspectRatio: 'LANDSCAPE' | 'PORTRAIT'
): Promise<{ operationName: string; sceneId: string }> => {
    // [SỬA LỖI] Bổ sung "tool": "PINHOLE" vào clientContext
    const clientGeneratedSceneId = `client-generated-uuid-${Date.now()}-${Math.random()}`;
    const requestBody = {
        "clientContext": { 
            "projectId": projectId,
            "tool": "PINHOLE" 
        },
        "requests": [{
            "aspectRatio": `VIDEO_ASPECT_RATIO_${aspectRatio}`,
            "seed": Math.floor(Math.random() * 100000),
            "textInput": { "prompt": prompt },
            "videoModelKey": "veo_3_0_t2v_fast",
            "metadata": [{ "sceneId": clientGeneratedSceneId }]
        }]
    };
    
    const response = await fetchViaMain(`${VEO_API_BASE_URL}/video:batchAsyncGenerateVideoText`, cookie, {
        method: 'POST',
        body: JSON.stringify(requestBody),
    });

    const operation = response?.operations?.[0];
    const operationName = operation?.operation?.name;
    const sceneId = operation?.sceneId;

    if (!operationName || !sceneId) {
        console.error("Unexpected response for generateVideo:", response);
        throw new Error('Failed to parse operationName or sceneId from response.');
    }
    return { operationName, sceneId };
};

export const checkVeoVideoStatus = async (cookie: UserCookie, operationName: string, sceneId: string) => {
    const url = `${VEO_API_BASE_URL}/video:batchCheckAsyncVideoGenerationStatus`;
    const requestBody = {
        "operations": [[{ "operation": {"name": operationName}, "sceneId": sceneId }]]
    };
    
    const response = await fetchViaMain(url, cookie, {
        method: 'POST',
        body: JSON.stringify(requestBody),
    });
    
    return response.operations[0];
};