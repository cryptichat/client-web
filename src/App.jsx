import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import ChatMain from "./pages/chatmain";

import { ContractProvider } from "./utils/ContractProvider";

function App() {
  return (
    <ContractProvider>
      <div className="App h-screen">
        <Routes>
          <Route path="/" element={<ChatMain />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Routes>
      </div>
    </ContractProvider>
  );
}

export default App;
