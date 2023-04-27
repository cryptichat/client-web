import React, { useState } from 'react';
import { FiSmile } from 'react-icons/fi';

const emojis = [
    '🖕'
    // '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'
];

export default function CustomEmojiPicker({ onSelect }) {
    const [isOpen, setIsOpen] = useState(false);

    const togglePicker = (e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button className="emoji-icon-button" onClick={(e) => togglePicker(e)}>
                <FiSmile size={24} />
            </button>
            {isOpen && (
                <div className="emoji-picker">
                    {emojis.map((emoji, index) => (
                        <button
                            key={index}
                            className="emoji-button"
                            onClick={(e) => {
                                e.preventDefault();
                                onSelect(emoji)
                            }}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}
