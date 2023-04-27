import React, { useState, useEffect, useRef } from "react";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import MessageItem from "../components/MessageItem";
import { BsFillSendFill } from "react-icons/bs";
import { BiArrowBack } from "react-icons/bi";
import { CgAttachment } from "react-icons/cg";
import useWindowSize from "../hooks/useWindowSize";
import { BiMessageRoundedAdd } from "react-icons/bi";
import { MdGroupAdd } from "react-icons/md";
import { motion } from "framer-motion";
import lock192 from "../pages/lock192.png";
import { decryptSymmetricKey, encryptText, decryptText } from "../utils/crypto";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import CustomEmojiPicker from './CustomEmojiPicker';

const GET_MESSAGE = gql`
  query MessagesByConversation(
    $conversationId: Int!
    $nMessages: Int!
    $token: String!
    $offset: Int!
  ) {
    me(token: $token) {
      conversations(
        nConversations: 1
        token: $token
        conversationId: $conversationId
      ) {
        id
        messages(nMessages: $nMessages, offset: $offset) {
          sender {
            username
          }
          timestamp
          revision
          content
        }
      }
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription MessageSubscription($conversationId: Int!, $token: String!) {
    newMessage(conversationId: $conversationId, token: $token) {
      sender {
        username
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
  const [showPrompt, setShowPrompt] = useState(
    Object.keys(activeConvo).length === 0
  );
  const [moreMessagesLoading, setMoreMessagesLoading] = useState(false);
  const messageContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageBoxRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const welcomePromptStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    fontSize: "1.2rem",
    color: "#666",
    textAlign: "center",
    padding: "20px",
  };

  const lock192Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    setShowPrompt(Object.keys(activeConvo).length === 0);
  }, [activeConvo]);

  let token = localStorage.getItem("auth-token");

  console.log("active convo", activeConvo);
  const { width: windowWidth } = useWindowSize();

  const [messageText, setMessageText] = useState("");
  const [symmetricKey, setSymmetricKey] = useState({});
  const [activeMessages, setActiveMessages] = useState([]);

  const [GetMessages, { subscribeToMore, fetchMore }] = useLazyQuery(
    GET_MESSAGE,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: (res) => {
        processMessages(res.me.conversations[0].messages);
      },
      notifyOnNetworkStatusChange: true,
      onError: (graphQLErrors) => {
        console.error(graphQLErrors);
        toast.error("Error retrieving messages, please check console");
      },
    }
  );

  const [SendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (SendMessage) => { },
    notifyOnNetworkStatusChange: true,
    onError: (err) => {
      console.error(err);
      toast.error("Error sending message, please check console");
    },
  });

  async function processMessages(messages) {
    const sortedMessages = [...messages].sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    async function decryptMessages() {
      const decryptedMessages = [];

      for (let message of sortedMessages) {
        const decryptedContent = await decryptText(
          message.content,
          symmetricKey
        );
        decryptedMessages.push({
          ...message,
          content: decryptedContent,
        });
      }

      return decryptedMessages;
    }

    decryptMessages().then((decryptedMessages) => {
      setActiveMessages(decryptedMessages);
    });
  }

  useEffect(() => {
    if (activeConvo.conv_id) {
      subscribeToMore({
        document: MESSAGE_SUBSCRIPTION,
        variables: {
          conversationId: parseInt(activeConvo.conv_id),
          token: token,
        },
        shouldResubscribe: true,
        onError: (err) => console.error(err),
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          console.log("subscription data", subscriptionData.data);

          return Object.assign({}, prev, {
            me: {
              conversations: [
                {
                  ...prev.me.conversations[0],
                  messages: [
                    ...prev.me.conversations[0].messages,
                    subscriptionData.data.newMessage,
                  ],
                },
              ],
            },
          });
        },
      });
      if (!moreMessagesLoading) scrollToBottom();
    }
  }, [activeMessages]);

  useEffect(() => {
    async function func() {
      if (
        Object.keys(activeConvo).length > 0 &&
        Object.keys(symmetricKey).length > 0
      ) {
        console.log("active convo messages view", activeConvo);
        console.log("attempting to retrieve messages");
        const res = await GetMessages({
          variables: {
            conversationId: parseInt(activeConvo.conv_id),
            nMessages: 10,
            token: token,
            offset: 0,
          },
          fetchPolicy: "cache-and-network",
          notifyOnNetworkStatusChange: true,
        });

        await processMessages(res.data.me.conversations[0].messages);
      }
    }
    func();
  }, [symmetricKey]);

  useEffect(() => {
    async function decryptKey() {
      console.log("active convo key decryption", activeConvo);
      // decrypt symmetric key
      try {
        const decryptedSymmetricKey = await decryptSymmetricKey(
          activeConvo.aesKey,
          localStorage.getItem("privateKey")
        );
        setSymmetricKey(decryptedSymmetricKey);
      } catch (err) {
        console.error(err);
        toast.error("Error decrypting symmetric key, please check console");
      }
    }

    if (Object.keys(activeConvo).length > 0 && activeConvo.aesKey) decryptKey();
  }, [activeConvo]);

  async function handleSendMessage() {
    if (messageText === "") {
      return;
    }

    // encrypt message
    const encryptedMessage = await encryptText(messageText, symmetricKey);
    SendMessage({
      variables: {
        content: encryptedMessage,
        conversationId: parseInt(activeConvo.conv_id),
        token: token,
      },
    }).then((res) => {
      console.log("sent message", res.data);
      setActiveMessages([
        ...activeMessages,
        { ...res.data["createMessage"]["message"], content: messageText },
      ]);
      setMessageText("");
    });
  }

  function getDisplayName(users) {
    if (users.length == 1) {
      return users[0].username;
    } else {
      let displayName = "";
      for (let user of users) {
        displayName += user.username + ", ";
      }
      return displayName.slice(0, -2);
    }
  }

  function handleScroll() {
    const messageContainerDiv = messageContainerRef.current;
    if (
      messageContainerDiv.scrollTop === 0 &&
      activeMessages.length > 0 &&
      !moreMessagesLoading
    ) {
      console.log("retrieve more messages");
      setMoreMessagesLoading(true);
      fetchMore({
        variables: { offset: activeMessages.length },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          console.log("fetch more result", fetchMoreResult);
          return Object.assign({}, prev, {
            me: {
              conversations: [
                {
                  ...prev.me.conversations[0],
                  messages: [
                    ...fetchMoreResult.me.conversations[0].messages,
                    ...prev.me.conversations[0].messages,
                  ],
                },
              ],
            },
          });
        },
      }).then(() => {
        setMoreMessagesLoading(false);
        console.log("done retrieving more messages");
      });
    }
  }

  const insertAtCursor = (emoji) => {
    const input = messageBoxRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;

    const newValue = value.substring(0, start) + emoji + value.substring(end);
    setMessageText(newValue);

    // Move the cursor after the inserted emoji
    const newCursorPosition = start + emoji.length;
    input.focus();
    input.setSelectionRange(newCursorPosition, newCursorPosition);
  };

  const messageIconVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 },
  };

  const transition = {
    type: "spring",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <motion.div
      className="messageview flex flex-col w-full lg:w-5/6 h-screen mx-auto my-auto shadow-md"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {showPrompt && (
        <div className="mt-60">
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
              className="welcome text-[30px] text-white font-bold p-1"
              variants={itemVariants}
            >
              Welcome to Cryptic Chat!
            </motion.p>
            <motion.p className="max-w-[700px]" variants={itemVariants}>
              <strong>Click</strong> on a user or create a conversation by
              clicking on either the individual messaging icon
              <span className="inline-flex items-center">
                {" "}
                <BiMessageRoundedAdd className="mr-2 ml-2 my-1 border text-[25px] text-white bg-slate-900 rounded-[5px]" />
              </span>
              <span className="inline-flex items-center">
                or the group messaging icon{" "}
                <MdGroupAdd className="mr-2 ml-2 text-[23px] mb-2 border text-white bg-slate-900 rounded-[5px]" />
              </span>
              to <strong>get started</strong>!
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
            <p className="font-black pl-1 text-2xl">
              {getDisplayName(activeConvo.user)}
            </p>
          </motion.div>
          <motion.div
            className="scroll grow px-4 md:max-h-full max-h-[85%] overflow-y-scroll custom-scrollbar"
            variants={itemVariants}
            ref={messageContainerRef}
            onScroll={handleScroll}
          >
            {moreMessagesLoading ? (
              <div className="text-center">
                <Spinner />
              </div>
            ) : null}
            {activeMessages.map((message, index) => (
              <MessageItem message={message} index={index} />
            ))}
            <div ref={messagesEndRef} />
          </motion.div>
          <motion.div className="flex h pb-2 items-center" variants={itemVariants}>
            <form className="inputContainer flex-1 py-2">
              <input
                type="text"
                placeholder="Message"
                className="mt-1 py-5 pl-4 mx-2 bg-gray-100 rounded-[10px] outline-none text-gray-700"
                style={{ width: "-webkit-fill-available" }}
                name="message"
                onChange={(e) => setMessageText(e.target.value)}
                ref={messageBoxRef}
                value={messageText}
                required
              />
              <CustomEmojiPicker
                onSelect={(emoji) => insertAtCursor(emoji)}
              />
            </form>
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
  )
}