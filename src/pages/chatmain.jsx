import React, { useState, useEffect } from "react";
import useWindowSize from "../hooks/useWindowSize";
import ChatActionsView from "../components/ChatActionsView";
import ChatMessageView from "../components/ChatMessageView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./styles.css";

function ChatMain() {
  const size = useWindowSize();

  const [activeConvo, setActiveConvo] = useState({});
  console.log("from chat main", activeConvo);
  console.log("screen width", size.width < 768);

  function renderActionsView() {
    return (
      <ChatActionsView
        activeConvo={activeConvo}
        setActiveConvo={setActiveConvo}
      />
    );
  }

  function renderMessageView() {
    return <ChatMessageView activeConvo={activeConvo} />;
  }

  function renderResponsive() {
    if (size.width > 768)
      return (
        <>
          {renderActionsView()}
          {renderMessageView()}
        </>
      );
    else {
      return !activeConvo.user ? renderActionsView() : renderMessageView();
    }
  }

  return (
    <div className="flex w-screen main-chat h-screen divide-solid">
      <ToastContainer theme="dark" />
      {renderResponsive()}
    </div>
  );
}

export default ChatMain;
