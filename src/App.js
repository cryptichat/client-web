import { Routes, Route } from "react-router-dom"
import Login from "./pages/login"
import Register from "./pages/register"
import ChatMain from "./pages/chatmain"

function App() {
  return (
    <div className="App h-screen">
      <Routes>
        <Route path="/" element={ <ChatMain/> } />
        <Route path="login" element={ <Login/> } />
        <Route path="register" element={ <Register/> } />
      </Routes>
    </div>
  )
}

export default App