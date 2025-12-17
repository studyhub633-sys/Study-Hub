import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// #region agent log
console.log('[DEBUG] main.tsx:7 - main.tsx executing, rootExists:', !!document.getElementById("root"));
fetch('http://127.0.0.1:7242/ingest/668e5ddb-32f9-4036-9a85-0a4ba19db7f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:7',message:'main.tsx executing',data:{rootExists:!!document.getElementById("root")},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-startup',hypothesisId:'A'})}).catch(()=>{});
// #endregion

const rootElement = document.getElementById("root");

// #region agent log
console.log('[DEBUG] main.tsx:12 - Root element check, rootElement:', !!rootElement, 'rootId:', rootElement?.id);
fetch('http://127.0.0.1:7242/ingest/668e5ddb-32f9-4036-9a85-0a4ba19db7f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:12',message:'Root element check',data:{rootElement:!!rootElement,rootId:rootElement?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-startup',hypothesisId:'A'})}).catch(()=>{});
// #endregion

if (!rootElement) {
  // #region agent log
  console.error('[DEBUG] main.tsx:16 - ERROR: Root element not found');
  fetch('http://127.0.0.1:7242/ingest/668e5ddb-32f9-4036-9a85-0a4ba19db7f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:16',message:'ERROR: Root element not found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-startup',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  throw new Error("Root element not found");
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/668e5ddb-32f9-4036-9a85-0a4ba19db7f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:22',message:'Creating root and rendering App',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-startup',hypothesisId:'A'})}).catch(()=>{});
// #endregion

const root = createRoot(rootElement);

// #region agent log
fetch('http://127.0.0.1:7242/ingest/668e5ddb-32f9-4036-9a85-0a4ba19db7f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:27',message:'Root created, about to render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-startup',hypothesisId:'A'})}).catch(()=>{});
// #endregion

try {
  console.log('[DEBUG] main.tsx:33 - About to render App component');
  root.render(<App />);
  
  // #region agent log
  console.log('[DEBUG] main.tsx:36 - App render called successfully');
  fetch('http://127.0.0.1:7242/ingest/668e5ddb-32f9-4036-9a85-0a4ba19db7f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:36',message:'App render called successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-startup',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
} catch (error) {
  // #region agent log
  console.error('[DEBUG] main.tsx:41 - ERROR during render:', error);
  fetch('http://127.0.0.1:7242/ingest/668e5ddb-32f9-4036-9a85-0a4ba19db7f5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:41',message:'ERROR during render',data:{error:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-startup',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.error('Error rendering app:', error);
  throw error;
}
