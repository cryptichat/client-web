import React from "react";

function ConvoListItem({ username, key, onClick, active }) {
  return (
    <li
      key={key}
      className={`w-full flex justify-start pl-1 py-2 hover:bg-slate-600 ${
        active ? "bg-slate-600" : null
      } cursor-pointer rounded-md`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <p className="w-36 truncate text-left">{username}</p>
      </div>
    </li>
  );
}

export default ConvoListItem;
