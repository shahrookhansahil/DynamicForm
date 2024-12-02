import React from "react";
import ReactDOM from "react-dom/client";
import App from "@src/App";
import "@src/index.css";
// import 'primereact/resources/themes/nova-accent/theme.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "node_modules/react-grid-layout/css/styles.css";
import "node_modules/react-resizable/css/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
