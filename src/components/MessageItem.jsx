import React from "react";
import { motion } from "framer-motion";
import classNames from "classnames";
import { formatDistanceToNow } from 'date-fns';
import { CgProfile } from "react-icons/cg";

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
    "relative": true,
    "pr-2": true,
    "flex flex-col justify-between": true,
  });

  const arrowClasses = classNames({
    "absolute top-4": true,
    "w-0 h-0": true,
    "border-4": true,
    "border-t-4 border-r-4 border-[#8b5cf6]": isSentByCurrentUser,
    "right-0 mr-[-4px]": isSentByCurrentUser,
  });

  const arrowClassesOtherUser = classNames({
    "absolute top-4": true,
    "w-0 h-0": true,
    "border-4": true,
    "border-t-4 border-l-4 border-neutral-800": true,
    "left-0 ml-[-4px]": true,
  });

  const isNewMessage = lastMessageFromUser && message.timestamp === lastMessageFromUser.timestamp;

  const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
  const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

  const messageDate = new Date(message.timestamp).toLocaleDateString(undefined, dateOptions);
  const messageTime = new Date(message.timestamp).toLocaleTimeString(undefined, timeOptions);

  let messageInfo = null;

  if (!lastMessageFromUser || message.sender.username !== lastMessageFromUser.sender.username) {
    messageInfo = (
      <span className="text-gray-300 text-xs pl-8">
        {messageDate} at {messageTime}
      </span>
    );
  }

  return (
    <div className={isSentByCurrentUser ? "flex items-start my-2 justify-end" : "flex items-start my-2"}>
      {!isSentByCurrentUser && <CgProfile className="text-white text-[33px] mr-2 mt-2" />}
      <motion.div
        className={messageClasses}
        initial={!isNewMessage ? { scale: 0 } : {}}
        animate={!isNewMessage ? { scale: 1 } : {}}
        exit={!isNewMessage ? { scale: 0 } : {}}
        transition={!isNewMessage ? { duration: 0.3 } : {}}
      >
        {isSentByCurrentUser ? (
          <div className={arrowClasses}></div>
        ) : (
          <div className={arrowClassesOtherUser}></div>
        )}

        <div className="flex justify-between items-center w-full">
          <p className="text-sm text-white">
            <b>{message.sender.username}</b>
          </p>
          {messageInfo && (
            <p className="text-sm text-gray-300">{messageInfo}</p>
          )}
        </div>

        <p className="text-sm text-white mt-1">
          <span>{message.content}</span>
        </p>
      </motion.div>
      {isSentByCurrentUser && <CgProfile className="text-white text-[33px] ml-2 mt-2" />}
    </div>
  );
}

export default MessageItem;
