import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || "");

export async function generateRAGResponse(input: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      You are an AI assistant specializing in power grid management and energy systems.
      Please provide a response to the following query: ${input}
      
      Respond in a professional but friendly manner, focusing on power grid related information.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    return "Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Proszę spróbować ponownie.";
  }
}

export async function processDocumentForRAG(text: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      Analyze the following text related to power grid management:
      ${text}
      
      Please provide a summary and key insights from this document.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error processing document:', error);
    return "Wystąpił błąd podczas przetwarzania dokumentu.";
  }
}