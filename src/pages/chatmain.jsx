import React, { useState, useEffect } from "react";
import ChatActionsView from "../components/ChatActionsView";
import ChatMessageView from "../components/ChatMessageView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./styles.css";

function ChatMain() {
  const [activeConvo, setActiveConvo] = useState({});

  return (
    <div className="flex w-screen main-chat lg:h-screen divide-solid">
      <ToastContainer theme="dark" />
      <ChatActionsView
        activeConvo={activeConvo}
        setActiveConvo={setActiveConvo}
      />
      <ChatMessageView activeConvo={activeConvo} />
    </div>
  );
}

export default ChatMain;
