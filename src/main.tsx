import { createRoot } from "react-dom/client";
import { PublicContentProvider, readPublicSnapshot } from "./seo/PublicContent";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<PublicContentProvider tables={readPublicSnapshot()}><App /></PublicContentProvider>);
