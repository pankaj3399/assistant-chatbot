import { AssistantsClient, AzureKeyCredential } from "@azure/openai-assistants";
import dotenv from 'dotenv';
import fs from 'fs';
import { extractPdfText } from '../utils/extractPdfText.js';
import { processWithAssistant } from '../config/assistant.js';
import Analysis from "../model/analysisModel.js"
import User from "../model/userModel.js"
dotenv.config();

 

export const analyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const userId = req.auth.userId

    if(!userId) return res.status(403).json({message: "Forbidden, Access Denied."})

    const question = req.body.question || null;
    const {messages, pdfData} = await processWithAssistant(req.file.buffer, question);

    // Extract text content from messages
    const analysis = messages.map(message => {
      return {
        role: message.role,
        content: message.content.map(c => c.type === 'text' ? c.text.value : null).filter(Boolean)
      };
    });
    const assistanceResponse = analysis.map(message => {
      if(message.role == 'assistant')
        return message.content
      else
        return ""
    })

    const reducedResponse = assistanceResponse.reduce((res, message) => res+message+" ","").trim()

    const user = await User.findOne({clerkId: userId})

    if(!user) return res.status(404).json({message:"User Not found"})

    await Analysis.create({
      userId: user._id,
      pdfData,
      response: reducedResponse,
      name: req.file.originalname
    })
    
    res.json({
      success: true,
      analysis: reducedResponse,
      pdfData
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export const testAssistant =  async (req, res) => {
    try {
      const assistantsClient = new AssistantsClient(
        process.env.AZURE_OPENAI_ENDPOINT,
        new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
      );
      
      const assistant = await assistantsClient.createAssistant({
        model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
        name: "Test Assistant",
        instructions: "Test instructions"
      });
      
      res.json({
        success: true,
        message: 'Connection successful',
        assistantId: assistant.id
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
}

export const testPdf = async (req, res) => {
    try{
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }
      const pdfContent = fs.readFileSync(req.file.path);
      console.log(pdfContent);
      const chunks = await extractPdfText(pdfContent)
      fs.unlinkSync(req.file.path);
      res.send(chunks)
    }catch(Err){
      console.log(Err);
      res.send("err")
      
    }
  }