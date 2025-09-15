import React from "react";
import { RiRobot3Fill } from "react-icons/ri";

const ChatMessage = ({ chat }) => {
  return (
    <div
      className={`message ${chat.role === "model" ? "bot-message" : "user-message"}`}
    >
      {chat.role === "model" && <RiRobot3Fill className="bot-logo" />}
      <p className="message-text">{chat.text}</p>
    </div>
  );
};

export default ChatMessage;