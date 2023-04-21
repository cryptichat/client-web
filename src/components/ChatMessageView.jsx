import React, { useState, useEffect } from "react";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import MessageItem from "../components/MessageItem";
import { BsFillSendFill } from "react-icons/bs";
import { BiArrowBack } from "react-icons/bi";
import { CgAttachment } from "react-icons/cg";
import useWindowSize from "../hooks/useWindowSize";
import { decryptSymmetricKey, encryptText, decryptText } from "../utils/crypto";

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
  let token = localStorage.getItem("auth-token");

  console.log("active convo", activeConvo);
  const { width: windowWidth } = useWindowSize();

  const [messageText, setMessageText] = useState("");
  const [symmetricKey, setSymmetricKey] = useState({});
  const [activeMessages, setActiveMessages] = useState([]);

  const [GetMessages] = useLazyQuery(GET_MESSAGE, {
    fetchPolicy: "cache-and-network",
    onCompleted: (res) => {
      console.log("poll res", res);
      processMessages(res.conversationById.messages);
    },
    // pollInterval: Object.keys(activeConvo) != 0 ? 1000 : 0, // only poll if a conversation is open
    notifyOnNetworkStatusChange: true,
    onError: (graphQLErrors) => {
      console.error(graphQLErrors);
      toast.error("Error retrieving messages, please check console");
    },
  });

  const [SendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (SendMessage) => {},
    notifyOnNetworkStatusChange: true,
    onError: (err) => {
      console.error(err);
      toast.error("Error sending message, please check console");
    },
  });

  function processMessages(messages) {
    const sortedMessages = [...messages].sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
    let decryptedMessages = [];
    console.log("symmetirc processed", symmetricKey);
    for (let message of sortedMessages) {
      decryptText(message.content, symmetricKey).then((res) => {
        decryptedMessages.push({
          ...message,
          content: res,
        });
      });
    }
    console.log("sorted from poll", sortedMessages);
    setActiveMessages(decryptedMessages);
  }

  useEffect(() => {
    async function func() {
      if (activeConvo) {
        console.log("active", activeConvo);

        // decrypt symmetric key
        const decryptedSymmetricKey = await decryptSymmetricKey(
          activeConvo.aesKey,
          localStorage.getItem("privateKey")
        );

        console.log("decrypted symmetric key", decryptedSymmetricKey);
        setSymmetricKey(decryptedSymmetricKey);

        const res = await GetMessages({
          variables: {
            conversationId: parseInt(activeConvo.conv_id),
            nMessages: 10,
            token: token,
          },
          fetchPolicy: "cache-and-network",
          notifyOnNetworkStatusChange: true,
        });

        // console.log("messages", res.data);
        // processMessages(res.data.conversationById.messages);
      }
    }
    func();
  }, [activeConvo]);

  useEffect(() => {
    if (Object.keys(symmetricKey).length > 0) {
      processMessages(activeConvo.messages); // hack until i figure out how to query a single conversation
    }
  }, [symmetricKey]);

  async function handleSendMessage() {
    console.log("message to send: " + messageText);
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

  return (
    <div className="messageview flex flex-col w-full lg:w-5/6 h-screen mx-auto my-auto shadow-md">
      {/* Messages */}
      <div className="flex items-center mx-2 my-2 md:my-3.5">
        {windowWidth < 768 && (
          <div className="p-2 rounded mt-1 mr-2 cursor-pointer hover:bg-slate-600">
            <BiArrowBack size={24} onClick={() => setActiveConvo({})} />
          </div>
        )}
        <p className="font-black pl-1 text-2xl">{activeConvo.user}</p>
      </div>
      <div className="scroll grow px-4 md:max-h-full max-h-[85%] overflow-scroll">
        {activeMessages.map((message, index) => (
          <MessageItem message={message} index={index} />
        ))}
      </div>
      <div className="flex h pb-2 items-center pr-2 ml-2">
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
