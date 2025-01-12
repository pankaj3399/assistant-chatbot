import { AssistantsClient, AzureKeyCredential } from "@azure/openai-assistants";
import dotenv from 'dotenv';
import { extractPdfText } from '../utils/extractPdfText.js';
dotenv.config()

export async function processWithAssistant(pdfBuffer, question) {
  const assistantsClient = new AssistantsClient(
    process.env.AZURE_OPENAI_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
  );

  try {
    // Create an assistant
    const assistant = await assistantsClient.createAssistant({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      name: "PDF Analyzer",
      instructions: "You are an AI assistant specialized in analyzing PDF documents. Please provide detailed analysis based on the content of the uploaded PDF.",
      tools: [{ type: "code_interpreter" }]
    });

    // Upload the PDF file
    const textChunks = await extractPdfText(pdfBuffer)
    const thread = await assistantsClient.createThread();
    for (const chunk of textChunks) {
      await assistantsClient.createMessage(
        thread.id,
        "user",
        "Here's a part of the PDF content: " + chunk
      );
    }

    // Create a thread

    // Add message to thread
    await assistantsClient.createMessage(
      thread.id,
      "user",
      question || "Please analyze this PDF document and provide key insights."
    );

    // Create and monitor run
    let run = await assistantsClient.createRun(thread.id, {
      assistantId: assistant.id
    });

    // Poll for completion
    while (run.status === "queued" || run.status === "in_progress") {
      let timeout = 10000
      await new Promise(resolve => setTimeout(resolve, timeout));
      if(timeout > 2000) timeout -= 2000
      run = await assistantsClient.getRun(thread.id, run.id);
       console.log(run, "Run Waiting");
    }

    // Get messages
    const messages = await assistantsClient.listMessages(thread.id);
     console.log(messages, "Run Messages");
    
    // Clean up

    return {messages: messages.data, pdfData: textChunks};
  } catch (error) {
    console.log(error);
    
    throw error;
  }
}