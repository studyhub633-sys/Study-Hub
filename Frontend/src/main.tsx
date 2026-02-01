import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n"; // Initialize i18n



const rootElement = document.getElementById("root");



if (!rootElement) {

  throw new Error("Root element not found");
}



const root = createRoot(rootElement);



try {
  console.log('[DEBUG] main.tsx:33 - About to render App component');
  root.render(<App />);


} catch (error) {

  console.error('Error rendering app:', error);
  throw error;
}
