import React, { useState } from "react";
import ConvoListItem from "../components/convoListItem";
import { BsFillSendFill } from "react-icons/bs";
import { BiMessageRoundedAdd } from "react-icons/bi";
import { BiLogOut } from "react-icons/bi";
import Add from '../image/clipimg.png'
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import "./styles.css";

const CREATE_CONVO = gql`
  mutation CreateConversation($directMessage: Boolean!, $token: String!, $users: [String]!) {
    createConversation(directMessage: $directMessage, token: $token, users: $users) {
        conversation{
            id
            }
        }
    }
`;



function ChatMain() {
  const [addChatOpen, setAddChatOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [conversations, setConversations] = useState([])
  const [createConvoText, setCreateConvoText] = useState('')

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("dsmessenger-username");
    navigate("/login");
  }

  const loggedInUsername = localStorage.getItem("dsmessenger-username");


  const [CreateConvoHandler] = useMutation(CREATE_CONVO, {
    onCompleted: ({ createConversation }) => {
      console.log(createConversation)
      localStorage.setItem("conversationId", createConversation.conversation.id);
      navigate("/");
    },
    onError: ({ graphQLErrors }) => {
      console.error(graphQLErrors);
      setErrors(graphQLErrors);
    },
  });

  return (
    <div className="flex w-screen main-chat lg:h-screen divide-solid">
      <div className="flex flex-col flex-grow lg:max-w-full border border-white border-t-0 border-l-0 border-b-0">
        {/* Convo list */}
        <div className="flex items-center justify-between">
          <p className="font-black mt-4 mb-3 pl-4 text-2xl">Conversations</p>
          <div className={`p-2 rounded mt-1 mr-2 cursor-pointer hover:bg-slate-600 ${addChatOpen && "bg-slate-600"}`}>
            <BiMessageRoundedAdd
              size={24}
              onClick={() => setAddChatOpen(!addChatOpen)}
            />
          </div>
        </div>
        {addChatOpen && (
          <div className="bg-slate-600 py-2 mb-2">
            <input
              type="text"
              placeholder="Enter username"
              className="mt-1 py-4 pl-4 mx-3 bg-gray-100 rounded-[10px] outline-none focus:text-gray-700"
              style={{ width: "-webkit-fill-available" }}
              name="message"
              onChange={setCreateConvoText}
              value={createConvoText}
              required
            />
            <a
              href="#"
              className="hidden bg-[#8b5cf6] md:flex border border-[#000000] p-2 mx-2 mt-2 mb-1
                                  text-[#ffffff] rounded-[10px] items-center gap-2
                                    hover:bg-[#4c1d95] hover:text-white transition duration-200"
              onClick={(e) => CreateConvoHandler({
                variables: {
                  directMessage: true,
                  token: localStorage.getItem("auth-token"),
                  users: [loggedInUsername, createConvoText]
                }
              })}
            >Start</a>
          </div>
        )}
        <div className="hidden lg:block pl-4 pr-4 text-white hover:rounded-md">
          <ul className="divide-y divide-gray-300 truncate">
            <ConvoListItem username={"User 1"} />
          </ul>
        </div>
        <div className="grow"></div>
        <div
          class="flex py-4 items-center"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <a
            href="#"
            className="hidden bg-zinc-900 md:flex
                                  text-[#ffffff] rounded-[10px] items-center gap-2
                                    hover:bg-zinc-900 hover:text-white transition duration-200"
          >
            <p
              className="flex px-3 scale-90 hover:scale-100 ease-in duration-200"
              onClick={handleLogout}
            >
              <BiLogOut className="text-[25px] mr-2" />
              {loggedInUsername}
            </p>
          </a>
        </div>
      </div>
      <div className="flex flex-col w-full lg:w-5/6 lg:h-screen lg:mx-auto lg:my-auto shadow-md">
        {/* Messages */}
        <div>
          <p className="font-black mt-4 mb-2 pl-4 text-2xl">Insert Username</p>
        </div>
        <div className="grow"></div>
        <div class="flex py-4 items-center">
          <div class="flex-1 py-2">
            <input
              type="text"
              placeholder="Message"
              className="mt-1 py-4 pl-4 mx-3 bg-gray-100 rounded-[10px] outline-none focus:text-gray-700"
              style={{ width: "-webkit-fill-available" }}
              name="message"
              required
            />
          </div>
          <div className="sendattach">
            <input style={{ display: "none" }} type="file" id="file" />
            <label htmlFor='file'>
              <img className='sendpic' src={Add} alt="" />
            </label>
          </div>
          <a
            href="#"
            className="hidden bg-[#8b5cf6] md:flex border border-[#000000] p-2 mx-2 mt-2 mb-1
                                  text-[#ffffff] rounded-[10px] items-center gap-2
                                    hover:bg-[#4c1d95] hover:text-white transition duration-200"
          >
            Send
            <BsFillSendFill />
          </a>
        </div>
      </div>
    </div>
  );
}

export default ChatMain;
