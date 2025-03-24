import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load the Firebase initialization
import "./lib/firebase";

createRoot(document.getElementById("root")!).render(<App />);
