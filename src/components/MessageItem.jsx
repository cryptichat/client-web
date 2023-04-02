import React from "react";

function MessageItem({ message }) {
  return (
    <p>
      <b>{message.sender.username}</b> : {message.content}
    </p>
  );
}

export default MessageItem;