import React from "react";
import ConvoListItem from "../components/convoListItem";
import Button from "./Button";
import { BsFillSendFill } from 'react-icons/bs'

import "./styles.css";

function ChatMain() {
  return (
    <div className="flex w-screen main-chat lg:h-screen divide-solid">
      <div className="flex flex-col flex-grow lg:max-w-full border border-white border-t-0 border-l-0 border-b-0">
        {/* Convo list */}
        <p className="font-black mt-4 mb-3 pl-4 text-2xl">Conversations</p>
        <div className="hidden lg:block pl-4 pr-4 text-white hover:rounded-md">
          <ul className="divide-y divide-gray-300 truncate">
            <ConvoListItem username={"User 1"} />
          </ul>
        </div>
      </div>
      <div className="flex flex-col w-full lg:w-5/6 lg:h-screen lg:mx-auto lg:my-auto shadow-md">
        {/* Messages */}
        <div>
          <p className="font-black mt-4 mb-2 pl-4 text-2xl">Insert Username</p>
        </div>
        <div className="grow"></div>
        <div
          class="flex py-4"
        >
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
          <a href="#" className='hidden md:flex border border-[#58629c] px-2 py-1 mx-2 mt-2 text-[#ffffff] rounded-[10px] items-center gap-2
                                        hover:bg-[#58629c] hover:text-white transition duration-200'>
            Send
            <BsFillSendFill />
          </a>
        </div>
      </div>
    </div>
  );
}

export default ChatMain;
