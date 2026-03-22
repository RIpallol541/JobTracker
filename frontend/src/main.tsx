import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { useAuthStore } from "./store/authStore";

async function bootstrap() {
  await useAuthStore.getState().bootstrap();
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
