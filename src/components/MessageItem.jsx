import React from "react";

function MessageItem({ message }) {
  const isSentByCurrentUser =
    message.sender.username === localStorage.getItem("dsmessenger-username");
  return (
    <div
      className={`${
        isSentByCurrentUser ? "bg-[#8b5cf6] rounded-[15px]" : "bg-neutral-800 rounded-[15px] "
      } min-w-[7%] w-fit p-3 my-2 rounded-lg ${
        isSentByCurrentUser ? "ml-auto" : "mr-auto"
      }`}
    >
      <p
        className={`text-${isSentByCurrentUser ? "white" : "gray-800"} text-sm`}
      >
        <b>{message.sender.username}</b>
        <p>{message.content}</p>
      </p>
    </div>
  );
}

export default MessageItem;
