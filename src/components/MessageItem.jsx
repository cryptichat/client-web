import React from "react";
import { motion } from "framer-motion";
import classNames from "classnames";

function MessageItem({ message, index, lastMessageFromUser }) {
  const isSentByCurrentUser =
    message.sender.username === localStorage.getItem("dsmessenger-username");

  const messageClasses = classNames({
    "bg-[#8b5cf6] rounded-[15px]": isSentByCurrentUser,
    "bg-neutral-800 rounded-[15px]": !isSentByCurrentUser,
    "min-w-[7%] w-fit p-3": true,
    "mb-2": index === 0,
    "my-2": index !== 0,
    "rounded-lg": true,
    "ml-auto": isSentByCurrentUser,
    "mr-auto": !isSentByCurrentUser,
  });

  const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
  const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

  const messageDate = new Date(message.timestamp).toLocaleDateString(undefined, dateOptions);
  const messageTime = new Date(message.timestamp).toLocaleTimeString(undefined, timeOptions);

  let messageInfo = null;

  if (!lastMessageFromUser || message.sender.username !== lastMessageFromUser.sender.username) {
    messageInfo = (
      <span className="text-gray-300 text-xs pl-5" >
        {messageDate} at {messageTime}
      </span>
    );
  }

  return (
    <motion.div
      className={messageClasses}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm text-white">
        <b>{message.sender.username}</b>
        {messageInfo}
        <br />
        <p>{message.content}</p>
      </p>
    </motion.div>
  );
}

export default MessageItem;
