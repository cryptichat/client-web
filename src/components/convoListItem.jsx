import React from "react";

function ConvoListItem({ username }) {
  return (
    <li className="w-full flex justify-start pl-1 py-2 hover:bg-slate-600 cursor-pointer rounded-md">
      <div className="flex items-center">
        <p className="w-36 truncate text-left">{username}</p>
      </div>
    </li>
  );
}

export default ConvoListItem;
