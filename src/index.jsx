import React from "react";
import ReactDOM from "react-dom/client"; // Notice the /client!
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";


ReactDOM.createRoot(document.getElementById("root-container")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);