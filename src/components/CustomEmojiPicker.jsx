import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsEmojiWinkFill } from 'react-icons/bs';

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'
];

const emojiVariants = {
  open: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  closed: { opacity: 0, y: -10 },
};

export default function CustomEmojiPicker({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  const togglePicker = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="emoji-icon-button"
        onClick={togglePicker}
      >
        <BsEmojiWinkFill
          className="bg-[#8b5cf6] flex border border-black p-1 mt-1.5 rounded-xl items-center hover:bg-[#4c1d95] text-white transition duration-200"
          size={30} style={{ blockSize: '40px', inlineSize: '30px' }}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="emoji-picker-container"
            style={{
              position: 'absolute',
              top: '-2.7rem',
              width: 'max-content',
              right: -80,
              zIndex: '999',
            }}
            variants={emojiVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="emoji-picker">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  className="emoji-button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(emoji);
                    setIsOpen(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
