import { GoogleGenAI, Type, GenerateContentResponse, Operation, Modality, GenerateVideosResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

const initializeClient = () => {
    const apiKey = localStorage.getItem('gemini-api-key');
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        ai = null;
    }
};

// Initialize on load
initializeClient();

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("API_KEY could not be retrieved. Please set it in the API Key settings.");
    }
    return ai;
};

export const getApiKey = (): string | null => {
    return localStorage.getItem('gemini-api-key');
}

export const setApiKeyAndReloadClient = (apiKey: string) => {
    localStorage.setItem('gemini-api-key', apiKey);
    initializeClient();
}

export const createStoryFromText = async (idea: string, wordCount: string, style: string): Promise<GenerateContentResponse> => {
    const client = getAiClient();
    const prompt = `Based on the following idea, write a ${style} story of about ${wordCount} words. The idea is: "${idea}". The story should be compelling and well-structured. Return only the story content.`;
    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a master storyteller, skilled in crafting engaging narratives in various styles."
        }
    });
    return response;
};

export const createStoryFromUrl = async (url: string, wordCount: string, style: string): Promise<GenerateContentResponse> => {
    const client = getAiClient();
    const groundingResponse = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Fetch the content from this URL: ${url}`,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const articleContent = groundingResponse.text;

    const prompt = `Based on the content of the article below, write a ${style} story of about ${wordCount} words. Develop the core themes and events from the article into a narrative. Article content: "${articleContent}"`;
    
    const storyResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a creative writer who transforms factual articles into captivating stories."
        }
    });
    return storyResponse;
};


export const createVideoPrompts = async (storyContent: string, granularity: string, style: string): Promise<GenerateContentResponse> => {
    const client = getAiClient();
    const prompt = `
        Analyze the following story and generate a series of video prompts for a VEO video.
        The video should have a ${style} style.

        Story:
        ---
        ${storyContent}
        ---

        Instructions:
        ${granularity === 'detailed'
            ? "Create multiple, detailed prompts. Each prompt should describe a distinct 8-second scene. The prompts should flow chronologically to tell the story. Focus on visual details: camera angles, character actions, environment, and mood."
            : "Create a single, comprehensive prompt that encapsulates the entire story's visual narrative. This prompt should guide the creation of a short film summarizing the story."
        }
        
        Return the result as a JSON array of objects, where each object has a "prompt" key.
    `;

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    prompts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                prompt: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });
    return response;
};


export const createThumbnailPrompt = async (storyContent: string): Promise<GenerateContentResponse> => {
    const client = getAiClient();
    const prompt = `
    Based on the following story, create a single, concise, and visually striking prompt for an image generation model (like Imagen) to create a thumbnail.
    The prompt should capture the absolute essence of the story's mood, main character, and key conflict or theme in one sentence.
    Focus on creating a highly dynamic and attention-grabbing image.

    Story:
    ---
    ${storyContent}
    ---
    `;
    return client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a professional marketing artist who specializes in creating viral-worthy thumbnail concepts."
        }
    });
}

export const generateThumbnailImage = async (prompt: string): Promise<string> => {
    const client = getAiClient(); // Giả sử hàm này đã được định nghĩa ở trên
    
    const response = await client.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: [{
            parts: [{ text: prompt }]
        }],
        // Yêu cầu API trả về cả TEXT và IMAGE để đáp ứng yêu cầu của model
        config: {
            responseModalities: ['IMAGE', 'TEXT']
        }
    });
    
    // Logic xử lý kết quả vẫn giữ nguyên, nó sẽ tìm và lấy ra phần hình ảnh
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData && imagePart.inlineData.mimeType) {
        const base64ImageBytes: string = imagePart.inlineData.data ?? '';
        const mimeType = imagePart.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    // Ném lỗi nếu không tìm thấy dữ liệu ảnh
    throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi từ API.");
}

export const generateVideo = async (prompt: string): Promise<Operation<GenerateVideosResponse>> => {
    const client = getAiClient();
    const operation = await client.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: {
            numberOfVideos: 1
        }
    });
    return operation;
};

export const checkVideoStatus = async (operation: Operation<GenerateVideosResponse>): Promise<Operation<GenerateVideosResponse>> => {
    const client = getAiClient();
    const updatedOperation = await client.operations.getVideosOperation({ operation: operation });
    return updatedOperation;
};

export const getVideoUrl = (operation: Operation<GenerateVideosResponse>): string | undefined => {
    if (operation.done && operation.response) {
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
             const apiKey = getApiKey();
             if(!apiKey) throw new Error("API Key not found for video URL");
             return `${downloadLink}&key=${apiKey}`;
        }
    }
    return undefined;
}

export const processYouTubeVideo = async (url: string, request: string): Promise<GenerateContentResponse> => {
    const client = getAiClient();
    
    const videoPart = {
        fileData: {
            // MimeType is not needed for fileUri according to latest practices
            fileUri: url
        }
    };

    const textPart = {
        text: request || "Please provide a full transcript for this video."
    };

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [videoPart, textPart] }
    });

    return response;
};