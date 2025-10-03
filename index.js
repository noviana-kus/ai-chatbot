// proses import dependency ke dalam file index.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

import 'dotenv/config';

// mulai persiapkan project kita

// 1. inisialisasi express

const app = express();
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// 2. inisialisasi middleware

app.use(cors());
// app.use(multer());
app.use(express.json());
app.use(express.static('public'));


// 3. inisialisasi endpoint
// [HTTP method: GET, POST, PUT, PATCH, DELETE]
// .get()    --> utamanya untuk mengambil data, atau search
// .post()   --> utamanya untuk menaruh (post) data baru ke dalam server
// .put()    --> utamanya untuk menimpa data yang sudah ada di dalam server
// .patch()  --> utamanya untuk "menambal" data yang sudah ada di dalam server
// .delete() --> utamanya untuk menghapus data yang ada di dalam server

// endpoint POST /chat
app.post(
  '/chat', // http://localhost:[PORT]/chat
  async (req, res) => {
    const { body } = req;
    const { conversation } = body;

    //body
    //{
    //conversation[]
    //  {role: ''('user'|'model'), text:''}
    //  ] //cek role sm text
    //}
  

    // guard clause -- satpam
    if (!conversation || !Array.isArray(conversation)) {
      res.status(400).json({
        message: "Percakapan harus valid!",
        data: null,
        success: false
      });
      return;
    }

    // guard clause #2 
    const conversationIsValid = conversation.every((message) => {
      //kondisi 1 -- messace harus truth
      if(!message) return false;

      //kondisi 2 -- messace object bkn array
      if(typeof message !== 'object' || Array.isArray(message)) return false;

      //kondisi 3 - messace berisi role dan text
      const keys = Object.keys(message);
      const keyLengthIsValid = keys.length === 2;
      const keyContainsValidName = keys.every(key => ['role','text'].includes(key));

      if(!keyLengthIsValid || !keyContainsValidName) return false;

      //kondisi 4 -- role user/model -- text string
      const { role, text } = message;
      const roleIsValid = ['user', 'model'].includes(role);
      const textIsValid = typeof text === 'string';

      if(!roleIsValid || !textIsValid) return false;


      return true;
    });
    
    if(!conversationIsValid){
       res.status(400).json({
        message: "Percakapan harus valid!",
        data: null,
        success: false
      });
      return;
    }

    // Map the conversation to the format expected by the Google GenAI SDK
    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    // main course
    try {
      // 3rd party API -- Google AI
       const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents
      });

      res.status(200).json({
        success: true,
        data: aiResponse.text,
        message: "Berhasil ditanggapi oleh Google Gemini Flash!"
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        success: false,
        data: null,
        message: e.message || "Ada masalah di server gan!"
      })
    }
  }
);

// entry point-nya
app.listen(3000, () => {
  console.log("I LOVE YOU 3000");
});