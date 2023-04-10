import React, { useState, useEffect } from "react";
import ChatActionsView from "../components/ChatActionsView";
import ChatMessageView from "../components/ChatMessageView";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useLazyQuery, gql } from "@apollo/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./styles.css";

const CREATE_CONVO = gql`
  mutation CreateConversation(
    $directMessage: Boolean!
    $token: String!
    $users: [String]!
    $keys: [String]!
  ) {
    createConversation(
      directMessage: $directMessage
      token: $token
      users: $users
      keys: $keys
    ) {
      conversation {
        id
      }
    }
  }
`;

const GET_CONVO = gql`
  query ConversationsByUser($nConversations: Int!, $token: String!) {
    conversationsByUser(nConversations: $nConversations, token: $token)
  }
`;

const GET_USERS = gql`
  query ConversationParticipants($conversationId: Int!, $token: String!) {
    conversationParticipants(conversationId: $conversationId, token: $token) {
      username
      publicKey
    }
  }
`;

function ChatMain() {
  const [errors, setErrors] = useState([]);
  const [userConversations, setUserConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState({});

  const navigate = useNavigate();

  const loggedInUsername = localStorage.getItem("dsmessenger-username");
  let token = localStorage.getItem("auth-token");

  const [CreateConvoHandler] = useMutation(CREATE_CONVO, {
    onCompleted: ({ createConversation }) => {
      console.log(createConversation);
      localStorage.setItem(
        "conversationId",
        createConversation.conversation.id
      );
      navigate("/");
    },
    onError: ({ graphQLErrors }) => {
      console.error(graphQLErrors);
      toast.error("Error creating conversation, please check console");
    },
  });

  const [GetUsers] = useLazyQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
    onCompleted: (GetUsers) => {},
    notifyOnNetworkStatusChange: true,
    onError: (graphQLErrors) => {
      console.error(graphQLErrors);
      toast.error("Internal error, please check console");
    },
  });
  

  const {
    loading: conv_loading,
    error: conv_error,
    data: conv_data,
  } = useQuery(GET_CONVO, {
    variables: { nConversations: 10, token: token },
    fetchPolicy: "cache-and-network",
    pollInterval: 3000,
  });

  useEffect(() => {
    toast("Welcome to CrypticChat!");
    async function func() {
      if (conv_data) {
        for (var i = 0; i < conv_data["conversationsByUser"].length; i++) {
          const res = await GetUsers({
            variables: {
              conversationId: conv_data["conversationsByUser"][i],
              token: token,
            },
            fetchPolicy: "cache-and-network",
            notifyOnNetworkStatusChange: true,
          });

          // skip adding convo to array if it already exists
          if (
            userConversations.filter(
              (convo) => convo.conv_id === conv_data["conversationsByUser"][i]
            ).length > 0
          ) {
            continue;
          }

          setUserConversations([
            ...userConversations,
            {
              id: userConversations.length,
              user: res.data["conversationParticipants"][0]["username"],
              conv_id: conv_data["conversationsByUser"][i],
            },
          ]);
        }
      }
    }
    func();
  }, [conv_data]);

  return (
    <div className="flex w-screen main-chat lg:h-screen divide-solid">
      <ToastContainer theme="dark" />
      <ChatActionsView
        loggedInUsername={loggedInUsername}
        activeConvo={activeConvo}
        setActiveConvo={setActiveConvo}
        userConversations={userConversations}
        createConvo={CreateConvoHandler}
      />
      <ChatMessageView activeConvo={activeConvo}/>
    </div>
  );
}

export default ChatMain;
