import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";

function ChatMain() {
  return (
    <div className="flex w-screen main-chat lg:h-screen divide-solid">
      <div className="flex flex-col flex-grow lg:max-w-full border border-white border-t-0 border-l-0 border-b-0">
        {/* Convo list */}
        <p className="font-black mt-4 mb-2 pl-4 text-2xl">Conversations</p>
      </div>
      <div className="flex w-full lg:w-5/6 lg:h-screen lg:mx-auto lg:my-auto shadow-md">
        {/* Messages */}
        <p className="font-black mt-4 mb-2 pl-4 text-2xl">Insert Username</p>
        <div class="hidden lg:col-span-2 lg:block">
          <div class="w-full">
            <input type="text" placeholder="Message"
                    class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                    name="message" required />
          </div>
        </div>

      </div>
    </div> 
  );
}

export default ChatMain;
