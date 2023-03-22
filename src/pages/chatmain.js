import React from "react";
import ConvoListItem from "../components/convoListItem";
import Button from "./Button";
import { BsFillSendFill, BsPatchPlusFill } from "react-icons/bs";
import { BiMessageRoundedAdd } from "react-icons/bi";
import { BiLogOut } from "react-icons/bi";
import { Link } from "react-router-dom";

import "./styles.css";

function ChatMain() {
  return (
    <div className="flex w-screen main-chat lg:h-screen divide-solid">
      <div className="flex flex-col flex-grow lg:max-w-full border border-white border-t-0 border-l-0 border-b-0">
        {/* Convo list */}
        <div className="flex items-center justify-between">
          <p className="font-black mt-4 mb-3 pl-4 text-2xl">Conversations</p>
          <div className="p-2 rounded mt-1 mr-2 cursor-pointer hover:bg-slate-600">
            <BiMessageRoundedAdd size={24} />
          </div>
        </div>
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
            <Link
              className="flex px-3 scale-90 hover:scale-100 ease-in duration-200"
              href="/"
            >
              <BiLogOut className="text-[25px] mr-2" />
              User 1
            </Link>
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
