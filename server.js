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
const PORT = 3004;

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
const paymentsDir = path.join(__dirname, 'Frontend', 'api', 'payments');
const authDir = path.join(__dirname, 'Frontend', 'api', 'auth');

async function loadRoutes() {
    // Map of endpoint paths to { directory, filename }
    const routeMap = {
        // AI routes → all handled by [action].js catch-all
        '/api/ai/generate-flashcards': { dir: apiDir, file: '[action].js' },
        '/api/ai/generate-knowledge-organizer': { dir: apiDir, file: '[action].js' },
        '/api/ai/generate-question': { dir: apiDir, file: '[action].js' },
        '/api/ai/generate-simple-question': { dir: apiDir, file: '[action].js' },
        '/api/ai/evaluate-answer': { dir: apiDir, file: '[action].js' },
        '/api/ai/chat': { dir: apiDir, file: '[action].js' },
        '/api/ai/health': { dir: apiDir, file: '[action].js' },
        '/api/ai/generate-mindmap': { dir: apiDir, file: '[action].js' },
        '/api/ai/grade-exam': { dir: apiDir, file: '[action].js' },

        // Payment routes → all handled by [action].js catch-all
        '/api/payments/create-payment': { dir: paymentsDir, file: '[action].js' },
        '/api/payments/activate': { dir: paymentsDir, file: '[action].js' },
        '/api/payments/subscription': { dir: paymentsDir, file: '[action].js' },
        '/api/payments/cancel': { dir: paymentsDir, file: '[action].js' },
        '/api/payments/payment-history': { dir: paymentsDir, file: '[action].js' },

        // Auth routes
        '/api/auth/grant-beta-premium': { dir: authDir, file: 'grant-beta-premium.js' },
    };

    try {
        for (const [route, { dir, file }] of Object.entries(routeMap)) {
            const filePath = path.join(dir, file);
            if (fs.existsSync(filePath)) {
                try {
                    const module = await import(`file://${filePath}`);
                    if (module.default) {
                        app.all(route, wrapHandler(module.default));
                        console.log(`Matched route: ${route} -> ${file}`);
                    }
                } catch (e) {
                    console.error(`Failed to load ${file}:`, e);
                }
            } else {
                console.warn(`File not found for route ${route}: ${file}`);
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
