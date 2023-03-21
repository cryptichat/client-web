import { Routes, Route } from "react-router-dom"
import Login from "./pages/login"
import Register from "./pages/register"
import Add_User from "./pages/add_user"
import Friends from "./pages/friends"
import Message from "./pages/message"
function App() {
  return (
    <div className="App">
      <Routes>
        {/* <Route path="/" element={ <Home/> } /> */}
        <Route path="login" element={ <Login/> } />
        <Route path="register" element={ <Register/> } />
        <Route path="add_user" element={ <Add_User/> } />
        <Route path="friends" element={ <Friends/> } />
        <Route path="message" element={ <Message/> } />
      </Routes>
    </div>
  )
}

export default App