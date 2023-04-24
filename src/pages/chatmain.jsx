import React, { useState, useEffect } from "react";
import useWindowSize from "../hooks/useWindowSize";
import ChatActionsView from "../components/ChatActionsView";
import ChatMessageView from "../components/ChatMessageView";
import { ToastContainer } from "react-toastify";
import { useQuery, gql } from "@apollo/client";
import "react-toastify/dist/ReactToastify.css";

import "./styles.css";

export const GET_ME = gql`
  query me($token: String!) {
    me(token: $token) {
      username
      publicKey
    }
  }
`;

function ChatMain() {
  const size = useWindowSize();
  const [activeConvo, setActiveConvo] = useState({});
  const [currentUser, setCurrentUser] = useState({});

  const { loading, error, data } = useQuery(GET_ME, {
    variables: { token: localStorage.getItem("auth-token") },
    onCompleted: (data) => {
      setCurrentUser(data.me);
    },
  });

  function renderActionsView() {
    return (
      <ChatActionsView
        activeConvo={activeConvo}
        setActiveConvo={setActiveConvo}
        user={currentUser}
      />
    );
  }

  function renderMessageView() {
    return (
      <ChatMessageView
        activeConvo={activeConvo}
        setActiveConvo={setActiveConvo}
        user={currentUser}
      />
    );
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
      {!loading ? renderResponsive() : <h1>Loading...</h1>}
    </div>
  );
}

export default ChatMain;
