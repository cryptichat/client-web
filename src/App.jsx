import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import ChatMain from "./pages/chatmain";

import { ContractProvider } from "./utils/ContractProvider";

function loggedIn() { return localStorage.getItem("auth-token") ? true : false; }

function App() {
  return (
    <ContractProvider>
      <div className="App h-screen">
        <Routes>
          <Route
            path="/"
            element={
              loggedIn() ? <ChatMain /> : <Navigate replace to={"/login"} />
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Routes>
      </div>
    </ContractProvider>
  );
}

export default App;
