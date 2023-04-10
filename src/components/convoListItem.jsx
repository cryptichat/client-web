import React from "react";
import { motion } from "framer-motion";

function ConvoListItem({ username, key, onClick, active }) {
  return (
    <motion.li
      key={key}
      className={`w-full flex justify-start pl-1 py-2 hover:bg-slate-600 ${
        active ? "bg-slate-600" : null
      } cursor-pointer rounded-md`}
      onClick={onClick}
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <p className="w-36 truncate text-left">{username}</p>
      </div>
    </motion.li>
  );
}

export default ConvoListItem;
