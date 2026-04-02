import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "./components/Toast"

import Home      from "./pages/Home"
import Units     from "./pages/Units"
import Questions from "./pages/Questions"
import Auth      from "./pages/Auth"

function App(){
    return(
        <BrowserRouter>

            <ToastContainer />

            <Routes>
                <Route path="/"                               element={<Home/>}/>
                <Route path="/units/:year/:subject"           element={<Units/>}/>
                <Route path="/questions/:year/:subject/:unit" element={<Questions/>}/>

                {/* Auth — Google sign-in only */}
                <Route path="/auth"  element={<Auth/>}/>
                <Route path="/login" element={<Auth/>}/>
            </Routes>

        </BrowserRouter>
    )
}

export default App
