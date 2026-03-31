import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { ThemeProvider } from "./context/ThemeContext"
import { GoogleOAuthProvider } from "@react-oauth/google"
import 'katex/dist/katex.min.css'

ReactDOM.createRoot(document.getElementById("root")).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </GoogleOAuthProvider>
)