import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { FinanceProvider } from "./store/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FinanceProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FinanceProvider>
  </StrictMode>,
);
