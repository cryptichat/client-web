import React from "react";
import { motion } from "framer-motion";

function MessageItem({ message, index }) {
  const isSentByCurrentUser =
    message.sender.username === localStorage.getItem("dsmessenger-username");
  return (
    <motion.div
      className={`${
        isSentByCurrentUser ? "bg-[#8b5cf6] rounded-[15px]" : "bg-neutral-800 rounded-[15px] "
      } min-w-[7%] w-fit p-3 ${index == 0 ? `mb-2` : `my-2`} rounded-lg ${
        isSentByCurrentUser ? "ml-auto" : "mr-auto"
      }`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p
        className={`text-${isSentByCurrentUser ? "white" : "gray-800"} text-sm`}
      >
        <b>{message.sender.username}</b>
        <p>{message.content}</p>
      </p>
    </motion.div>
  );
}

export default MessageItem;
