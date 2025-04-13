import React, { useState } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import { RiRobot3Fill } from "react-icons/ri";
import { FaCommentAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import ChatForm from "./ChatForm";
import "./Chatbot.css";
import ChatMessage from "./ChatMessage";

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);

  const generateBotResponse = (history) => {
    console.log(history);
  };
  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        className="chatbot-toggler d-flex justify-content-center align-items-center"
        onClick={() => setShowChatbot((prev) => !prev)}
      >
        <span>
          <FaCommentAlt className="on" />
        </span>
        <span>
          <IoMdClose className="off" />
        </span>
      </button>

      <div className="chat-popup">
        <div className="chat-header">
          <div className="header-info">
            <RiRobot3Fill className="bot-logo" />
            <div className="logo-text pt-1 "> ChatBot</div>
          </div>
          <button onClick={() => setShowChatbot((prev) => !prev)}>
            <TiArrowSortedDown />
          </button>
        </div>

        <div className="chat-body">
          <div className="message bot-message">
            <RiRobot3Fill className="bot-logo" />
            <p className="message-text">
              Hello! I'm your AI assistant. How can I help you today?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;