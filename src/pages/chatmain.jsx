import React, { useState, useEffect } from "react";
import ChatActionsView from "../components/ChatActionsView";
import MessageItem from "../components/MessageItem";
import { BsFillSendFill } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
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

const SEND_MESSAGE = gql`
  mutation CreateMessage(
    $content: String!
    $conversationId: Int!
    $token: String!
  ) {
    createMessage(
      content: $content
      conversationId: $conversationId
      token: $token
    ) {
      message {
        sender {
          username
        }
        conversation {
          id
        }
        timestamp
        revision
        content
      }
    }
  }
`;

const GET_MESSAGE = gql`
  query MessagesByConversation(
    $conversationId: Int!
    $nMessages: Int!
    $token: String!
  ) {
    messagesByConversation(
      conversationId: $conversationId
      nMessages: $nMessages
      token: $token
    ) {
      sender {
        username
      }
      conversation {
        id
      }
      timestamp
      revision
      content
    }
  }
`;

function ChatMain() {
  const [errors, setErrors] = useState([]);
  const [userConversations, setUserConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState({});
  const [activeMessages, setActiveMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const navigate = useNavigate();

  const loggedInUsername = localStorage.getItem("dsmessenger-username");
  let get_token = localStorage.getItem("auth-token");

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

  const [GetMessages] = useLazyQuery(GET_MESSAGE, {
    fetchPolicy: "cache-and-network",
    onCompleted: (res) => {
      // sort messages array with most recent message last
      const sortedMessages = [...res.messagesByConversation].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      console.log("sorted from poll", sortedMessages);
      setActiveMessages(sortedMessages);
    },
    pollInterval: Object.keys(activeConvo) != 0 ? 1000 : 0, // only poll if a conversation is open
    notifyOnNetworkStatusChange: true,
    onError: (graphQLErrors) => {
      console.error(graphQLErrors);
      toast.error("Error retrieving messages, please check console");
    },
  });

  const [SendMessage] = useMutation(SEND_MESSAGE, {
    variables: {
      content: messageText,
      conversationId: activeConvo.conv_id,
      token: get_token,
    },
    onCompleted: (SendMessage) => {},
    notifyOnNetworkStatusChange: true,
    onError: (err) => {
      console.error(err);
      toast.error("Error sending message, please check console");
    },
  });

  function handleSendMessage() {
    console.log("message to send: " + messageText);
    if (messageText === "") {
      return;
    }

    SendMessage().then((res) => {
      console.log("sent message", res.data);
      setActiveMessages([
        ...activeMessages,
        res.data["createMessage"]["message"],
      ]);
      setMessageText("");
    });
  }

  const {
    loading: conv_loading,
    error: conv_error,
    data: conv_data,
  } = useQuery(GET_CONVO, {
    variables: { nConversations: 10, token: get_token },
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
              token: get_token,
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

  useEffect(() => {
    async function func() {
      if (activeConvo) {
        console.log("active", activeConvo);
        const res = await GetMessages({
          variables: {
            conversationId: activeConvo.conv_id,
            nMessages: 10,
            token: get_token,
          },
          fetchPolicy: "cache-and-network",
          notifyOnNetworkStatusChange: true,
        });

        // sort messages array with most recent message last
        const sortedMessages = [...res.data.messagesByConversation].sort(
          (a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
          }
        );
        console.log("sorted", sortedMessages);
        setActiveMessages(sortedMessages);
      }
    }
    func();
  }, [activeConvo]);

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
      <div className="flex flex-col w-full lg:w-5/6 lg:h-screen lg:mx-auto lg:my-auto shadow-md">
        {/* Messages */}
        <div>
          <p className="font-black mt-4 mb-2 pl-4 text-2xl">
            {activeConvo.user}
          </p>
        </div>
        <div className="grow px-4">
          {activeMessages.map((message) => (
            <MessageItem message={message} />
          ))}
        </div>
        <div className="flex py-4 items-center">
          <form className="inputContainer flex-1 py-2">
            <input
              type="text"
              placeholder="Message"
              className="mt-1 py-5 pl-4 mx-2 bg-gray-100 rounded-[10px] outline-none text-gray-700"
              style={{ width: "-webkit-fill-available" }}
              name="message"
              onChange={(e) => setMessageText(e.target.value)}
              value={messageText}
              required
            />
          </form>
          <div
            className="sendattach hidden bg-[#8b5cf6] md:flex border border-[#000000] px-2 p-2.5
                                  text-[#ffffff] rounded-[10px] items-center 
                                    hover:bg-[#4c1d95] hover:text-white transition duration-200"
          >
            <input style={{ display: "none" }} type="file" id="file" />
            <label htmlFor="file">
              {/* <img className="sendpic" src={Add} alt="" /> */}
              <CgAttachment className="text-[20px] text-white" />
            </label>
          </div>
          <div
            onClick={handleSendMessage}
            className="hidden bg-[#8b5cf6] md:flex border border-[#000000] p-2 mx-2 mt-2 mb-2
                                  text-[#ffffff] rounded-[10px] items-center gap-1.5
                                    hover:bg-[#4c1d95] hover:text-white transition duration-200"
          >
            Send
            <BsFillSendFill />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMain;
