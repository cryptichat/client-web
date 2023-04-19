import React, { useState, useEffect } from "react";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import MessageItem from "../components/MessageItem";
import { BsFillSendFill } from "react-icons/bs";
import { BiArrowBack } from "react-icons/bi";
import { CgAttachment } from "react-icons/cg";
import useWindowSize from "../hooks/useWindowSize";
import { BiMessageRoundedAdd } from 'react-icons/bi';
import { MdGroupAdd } from 'react-icons/md';
import { motion } from 'framer-motion';
import lock192 from "../pages/lock192.png";


const GET_MESSAGE = gql`
  query MessagesByConversation(
    $conversationId: Int!
    $nMessages: Int!
    $token: String!
  ) {
    conversationById(conversationId: $conversationId, token: $token) {
      messages(nMessages: $nMessages) {
        sender {
          username
        }
        timestamp
        revision
        content
      }
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

  const [showPrompt, setShowPrompt] = useState(Object.keys(activeConvo).length === 0);

  const welcomePromptStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontSize: '1.2rem',
    color: '#666',
    textAlign: 'center',
    padding: '20px',
  };

  const lock192Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    setShowPrompt(Object.keys(activeConvo).length === 0);
  }, [activeConvo]);

  let token = localStorage.getItem("auth-token");

  const { width: windowWidth } = useWindowSize();

  const [messageText, setMessageText] = useState("");
  const [activeMessages, setActiveMessages] = useState([]);

  const [GetMessages] = useLazyQuery(GET_MESSAGE, {
    fetchPolicy: "cache-and-network",
    onCompleted: (res) => {
      console.log("poll res", res);
      // sort messages array with most recent message last
      const sortedMessages = [...res.conversationById.messages].sort(
        (a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        }
      );
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
      conversationId: parseInt(activeConvo.conv_id),
      token: token,
    },
    onCompleted: (SendMessage) => { },
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
            conversationId: parseInt(activeConvo.conv_id),
            nMessages: 10,
            token: token,
          },
          fetchPolicy: "cache-and-network",
          notifyOnNetworkStatusChange: true,
        });

        console.log("messages", res.data);
        // sort messages array with most recent message last
        const sortedMessages = [...res.data.conversationById.messages].sort(
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

  const messageIconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
  };

  const transition = {
    type: 'spring',
    stiffness: 200,
    damping: 20,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="messageview flex flex-col w-full lg:w-5/6 h-screen mx-auto my-auto shadow-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showPrompt && (
        <div className="p-60">
          <div
            className="welcome-prompt"
            style={{
              ...welcomePromptStyle,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <motion.img
              src={lock192}
              width="100px"
              height="99.88px"
              alt="ChatApp logo"
              variants={lock192Variants}
              initial="hidden"
              animate="visible"
              transition={transition}
            />
            <motion.p
              className="text-[30px] text-white font-bold p-1"
              variants={itemVariants}
            >
              Welcome to Cryptic Chat!
            </motion.p>
            <motion.p variants={itemVariants}>
              Click on a user or create a conversation by clicking on either the
              <span className="inline-flex items-center">
                individual messaging icon{" "}
                <BiMessageRoundedAdd className="mr-2 ml-2 text-[25px] text-white" />
              </span>
              <span className="inline-flex items-center">
                or the group messaging icon{" "}
                <MdGroupAdd className="mr-2 ml-2 text-[25px] text-white" />
              </span>
              to get started!
            </motion.p>
          </div>
        </div>
      )}
      {!showPrompt && (
        <>
          {/* Messages */}
          <motion.div
            className="flex items-center mx-2 my-2 md:my-3.5"
            variants={itemVariants}
          >
            {windowWidth < 768 && (
              <div className="p-2 rounded mt-1 mr-2 cursor-pointer hover:bg-slate-600">
                <BiArrowBack size={24} onClick={() => setActiveConvo({})} />
              </div>
            )}
            <p className="font-black pl-1 text-2xl">{activeConvo.user}</p>
          </motion.div>
          <motion.div
            className="scroll grow px-4 md:max-h-full max-h-[85%] overflow-y-scroll custom-scrollbar"
            variants={itemVariants}
          >
            {activeMessages.map((message, index) => (
              <MessageItem message={message} index={index} />
            ))}
          </motion.div>
          <motion.div
            className="flex h pb-2 items-center pr-2 ml-2"
            variants={itemVariants}
          >
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
            <motion.div
              className="sendattach bg-[#8b5cf6] md:flex border border-[#000000] px-2 p-2.5
                          text-[#ffffff] rounded-[10px] items-center 
                            hover:bg-[#4c1d95] hover:text-white transition duration-200"
              variants={itemVariants}
            >
              <input style={{ display: "none" }} type="file" id="file" />
              <label htmlFor="file">
                {/* <img className="sendpic" src={Add} alt="" /> */}
                <CgAttachment className="text-[20px] text-white" />
              </label>
            </motion.div>
            <motion.div
              onClick={handleSendMessage}
              className="bg-[#8b5cf6] flex border border-[#000000] p-2 mx-2 mt-2 mb-2
                            text-[#ffffff] rounded-[10px] items-center gap-1.5
                              hover:bg-[#4c1d95] hover:text-white transition duration-200"
              variants={itemVariants}
            >
              Send
              <BsFillSendFill />
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  )};
