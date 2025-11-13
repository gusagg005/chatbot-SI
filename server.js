// 1. IMPORTS Y CONFIGURACIÓN
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai"; 

const app = express();
app.use(cors()); 
app.use(express.json());
const ai = new GoogleGenAI({});
const chatSessions = new Map(); 
app.use((req, res, next) => {
    req.sessionId = "user-project-uni"; 
    next();
});

// 2. RUTA PRINCIPAL DEL CHATBOT
app.post("/chat", async (req, res) => {
    const { message } = req.body;
    const { sessionId } = req;
    
    // Obtener o crear la sesión de chat con historial
    let chat = chatSessions.get(sessionId);
    if (!chat) {
        chat = ai.chats.create({
            model: "gemini-2.5-flash", 
            // Instrucción inicial del sistema para darle contexto al bot
            config: {
                systemInstruction: "Soy un asistente de proyecto universitario. Mi función es brindar respuestas útiles, claras y concisas sobre la NFL en especial las reglas y temas relacionados. Mantengo un tono formal, pero cercano y accesible."
            }
        });
        chatSessions.set(sessionId, chat);
    }

    try {
        const result = await chat.sendMessage({ message: message });
        const reply = result.text.trim();
        
        // 3. ENVIAR RESPUESTA AL FRONTEND
        res.json({ reply: reply });

    } catch (err) {
        console.error("Error al conectar con Gemini:", err);
        // Si hay un error de clave API, se mostrará aquí
        if (err.message.includes('API key')) {
             return res.status(500).json({ reply: "Hubo un error de configuración. Por favor, revisa la clave GEMINI_API_KEY en Render." });
        }
        res.status(500).json({ reply: "Hubo un error al contactar con la API de Gemini 😢" });
    }
});

// 4. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Servidor Gemini corriendo en el puerto " + PORT));