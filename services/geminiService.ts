// FIX: Import GenerateVideosResponse to use with the generic Operation type.
import { GoogleGenAI, Type, GenerateContentResponse, Operation, GenerateVideosResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createStoryFromText = async (idea: string, wordCount: string, style: string): Promise<GenerateContentResponse> => {
    const prompt = `Based on the following idea, write a ${style} story of about ${wordCount} words. The idea is: "${idea}". The story should be compelling and well-structured. Return only the story content.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a master storyteller, skilled in crafting engaging narratives in various styles."
        }
    });
    return response;
};

export const createStoryFromUrl = async (url: string, wordCount: string, style: string): Promise<GenerateContentResponse> => {
    const groundingResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Fetch the content from this URL: ${url}`,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const articleContent = groundingResponse.text;

    const prompt = `Based on the content of the article below, write a ${style} story of about ${wordCount} words. Develop the core themes and events from the article into a narrative. Article content: "${articleContent}"`;
    
    const storyResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a creative writer who transforms factual articles into captivating stories."
        }
    });
    return storyResponse;
};


export const createVideoPrompts = async (storyContent: string, granularity: string, style: string): Promise<GenerateContentResponse> => {
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

    const response = await ai.models.generateContent({
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
    const prompt = `
    Based on the following story, create a single, concise, and visually striking prompt for an image generation model (like Imagen 3) to create a thumbnail.
    The prompt should capture the absolute essence of the story's mood, main character, and key conflict or theme in one sentence.
    Focus on creating a highly dynamic and attention-grabbing image.

    Story:
    ---
    ${storyContent}
    ---
    `;
    return ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: "You are a professional marketing artist who specializes in creating viral-worthy thumbnail concepts."
        }
    });
}

export const generateThumbnailImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: [{
            parts: [{ text: prompt }]
        }],
        // Sửa lỗi 1: Đổi 'generationConfig' thành 'config'
        config: {
            responseMimeType: "image/png"
        }
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    // Sửa lỗi 2: Kiểm tra cả imagePart, inlineData, và mimeType trước khi sử dụng
    if (imagePart && imagePart.inlineData && imagePart.inlineData.mimeType) {
        const base64ImageBytes: string = imagePart.inlineData.data ?? '';
        const mimeType = imagePart.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi từ API.");
}


// FIX: Update function signature to use generic Operation<GenerateVideosResponse> type.
export const generateVideo = async (prompt: string): Promise<Operation<GenerateVideosResponse>> => {
    const operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: {
            numberOfVideos: 1
        }
    });
    return operation;
};

// FIX: Update function signature to use generic Operation<GenerateVideosResponse> type.
export const checkVideoStatus = async (operation: Operation<GenerateVideosResponse>): Promise<Operation<GenerateVideosResponse>> => {
    const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
    return updatedOperation;
};

// FIX: Update function signature to use generic Operation<GenerateVideosResponse> type.
export const getVideoUrl = (operation: Operation<GenerateVideosResponse>): string | undefined => {
    if (operation.done && operation.response) {
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
             return `${downloadLink}&key=${process.env.API_KEY}`;
        }
    }
    return undefined;
}