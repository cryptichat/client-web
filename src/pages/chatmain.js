import React from "react";

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
      </div>
    </div>
  );
}

export default ChatMain;
