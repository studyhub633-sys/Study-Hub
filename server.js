import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'Frontend', '.env') });

const app = express();
const PORT = 3003;

// Basic logging
const log = (msg) => {
    console.log(`[${new Date().toISOString()}] ${msg}`);
};

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    log(`${req.method} ${req.url}`);
    next();
});

// Helper to wrap Vercel-style handlers for Express
const wrapHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res);
    } catch (error) {
        log(`Handler error: ${error.message}\n${error.stack}`);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    }
};

// Dynamic route loader
const apiDir = path.join(__dirname, 'Frontend', 'api', 'ai');

async function loadRoutes() {
    if (!fs.existsSync(apiDir)) {
        console.error(`API directory not found: ${apiDir}`);
        return;
    }

    try {
        // Map of endpoint paths to filenames
        const routeMap = {
            '/api/ai/generate-flashcards': 'generate-flashcards.js',
            '/api/ai/generate-knowledge-organizer': 'generate-knowledge-organizer.js',
            '/api/ai/generate-question': 'generate-question.js',
            '/api/ai/generate-simple-question': 'generate-simple-question.js',
            '/api/ai/evaluate-answer': 'evaluate-answer.js',
            '/api/ai/chat': 'chat.js',
            '/api/ai/health': 'probe.js'
        };

        for (const [route, filename] of Object.entries(routeMap)) {
            const filePath = path.join(apiDir, filename);
            if (fs.existsSync(filePath)) {
                try {
                    // Import the module dynamically
                    const module = await import(`file://${filePath}`);
                    if (module.default) {
                        // Use correct method based on route usually POST, headers handles OPTIONS
                        app.all(route, wrapHandler(module.default));
                        console.log(`Matched route: ${route} -> ${filename}`);
                    }
                } catch (e) {
                    console.error(`Failed to load ${filename}:`, e);
                }
            } else {
                console.warn(`File not found for route ${route}: ${filename}`);
            }
        }

    } catch (error) {
        console.error('Error loading routes:', error);
    }
}

await loadRoutes();

// Default 404 for API
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API endpoints mapped from ${apiDir}`);
});
