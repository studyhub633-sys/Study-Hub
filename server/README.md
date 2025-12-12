# Study Spark Hub - Express.js Backend

Express.js backend server for Study Spark Hub with AI features powered by Hugging Face.

## Features

- ✅ Authentication with Supabase
- ✅ AI Question Generation (using `google/flan-t5-base`)
- ✅ Answer Evaluation (using `sentence-transformers/all-MiniLM-L6-v2`)
- ✅ Flashcard Generation from notes
- ✅ Protected API endpoints

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `HUGGINGFACE_API_KEY` - Hugging Face API token (get from https://huggingface.co/settings/tokens)

### 3. Get Hugging Face API Token

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Name it (e.g., "Study Hub API")
4. Select **"Read"** access (that's all you need)
5. Copy the token and add it to your `.env` file

### 4. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Health Check
```
GET /health
GET /api/ai/health
```

### AI Endpoints (All require authentication)

#### Generate Question
```
POST /api/ai/generate-question
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "context": "Mitochondria are the powerhouse of the cell...",
  "subject": "Biology",
  "difficulty": "medium" // optional: "easy", "medium", "hard"
}
```

Response:
```json
{
  "question": "What is the function of mitochondria in a cell?",
  "subject": "Biology",
  "difficulty": "medium",
  "context": "Mitochondria are the powerhouse..."
}
```

#### Evaluate Answer
```
POST /api/ai/evaluate-answer
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "correctAnswer": "Mitochondria produce ATP through cellular respiration",
  "studentAnswer": "Mitochondria make energy for the cell",
  "threshold": 0.7 // optional, default 0.7
}
```

Response:
```json
{
  "similarity": 0.85,
  "isCorrect": true,
  "threshold": 0.7,
  "feedback": "Your answer is correct!"
}
```

#### Generate Flashcards
```
POST /api/ai/generate-flashcards
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "notes": "Photosynthesis is the process by which plants convert light energy...",
  "subject": "Biology",
  "count": 5 // optional, max 10, default 5
}
```

Response:
```json
{
  "flashcards": [
    {
      "question": "What is photosynthesis?",
      "answer": "The process by which plants convert light energy into chemical energy",
      "subject": "Biology"
    },
    // ... more flashcards
  ],
  "count": 5,
  "requested": 5
}
```

## Authentication

All AI endpoints require a Supabase JWT token in the Authorization header:

```javascript
const token = await supabase.auth.getSession();
// Use token.session.access_token

fetch('http://localhost:3001/api/ai/generate-question', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token.session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ... })
});
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing required fields)
- `401` - Unauthorized (invalid or missing token)
- `503` - Service unavailable (model loading, missing API key)

## Security Notes

- ✅ API keys are stored server-side only
- ✅ All AI endpoints require authentication
- ✅ User tokens are verified with Supabase
- ✅ No sensitive data exposed to frontend

## Troubleshooting

### "Model is loading" error
Some Hugging Face models need to be "warmed up" on first use. Wait 30-60 seconds and try again.

### "Missing API key" error
Make sure `HUGGINGFACE_API_KEY` is set in your `.env` file and the server has been restarted.

### CORS errors
The server has CORS enabled for all origins. For production, you may want to restrict this to your frontend domain.

## Development

The server uses ES modules (`"type": "module"` in package.json) and modern JavaScript features.

