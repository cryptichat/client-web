import React, { useState, useEffect } from "react";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import MessageItem from "../components/MessageItem";
import { BsFillSendFill } from "react-icons/bs";
import { BiArrowBack } from "react-icons/bi";
import { CgAttachment } from "react-icons/cg";
import useWindowSize from "../hooks/useWindowSize";

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

export default function ChatMessageView({ activeConvo, setActiveConvo }) {
  let token = localStorage.getItem("auth-token");

  const { width: windowWidth } = useWindowSize();

  const [messageText, setMessageText] = useState("");
  const [activeMessages, setActiveMessages] = useState([]);

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
      token: token,
    },
    onCompleted: (SendMessage) => {},
    notifyOnNetworkStatusChange: true,
    onError: (err) => {
      console.error(err);
      toast.error("Error sending message, please check console");
    },
  });

  useEffect(() => {
    async function func() {
      if (activeConvo) {
        console.log("active", activeConvo);
        const res = await GetMessages({
          variables: {
            conversationId: activeConvo.conv_id,
            nMessages: 10,
            token: token,
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

  return (
    <div className="flex flex-col w-full lg:w-5/6 h-screen mx-auto my-auto shadow-md">
      {/* Messages */}
      <div className="flex items-center mx-2 my-2 md:my-3.5">
        {windowWidth < 768 && <div
          className="p-2 rounded mt-1 mr-2 cursor-pointer hover:bg-slate-600"
        >
          <BiArrowBack size={24} onClick={() => setActiveConvo({})} />
        </div>}
        <p className="font-black pl-1 text-2xl">{activeConvo.user}</p>
      </div>
      <div className="grow px-4 md:max-h-full max-h-[85%] overflow-scroll">
        {activeMessages.map((message, index) => (
          <MessageItem message={message} index={index}/>
        ))}
      </div>
      <div className="flex h pb-2 items-center">
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
          className="sendattach bg-[#8b5cf6] md:flex border border-[#000000] px-2 p-2.5
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
          className="bg-[#8b5cf6] flex border border-[#000000] p-2 mx-2 mt-2 mb-2
                                  text-[#ffffff] rounded-[10px] items-center gap-1.5
                                    hover:bg-[#4c1d95] hover:text-white transition duration-200"
        >
          Send
          <BsFillSendFill />
        </div>
      </div>
    </div>
  );
}
