import React, { useState } from "react";
import useApi from "../hooks/useApi";
import Loading from "./Loading";
import { useEffect } from "react";
import { login, logout } from "../utils/auth";
import toast from "react-hot-toast";
import { getConversation } from "../utils/chat";
import TextInput from "./TextInput";
import { encryptData } from "../utils/encryptData";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const { loading, chatCompletion, chatMessage, setChatMessage } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.auth.isAuthenticated) {
      toast.error("You are not authenticated");
      return;
    }

    if (question) {
      const newMessage = { content: question, role: "user" };
      setChatMessage(prevMessages => [...prevMessages, newMessage]);
      await chatCompletion([newMessage]);
      setQuestion("");
    }
  };

  const onValidateOpenaiAPI = (e) => {
    if (1) {
      setOpenaiKey(e.target.value);
    } else {
      setOpenaiKey("");
    }
  };

  const onSaveOpenaiKey = () => {
    if (!openaiKey) return toast.error("Invalid Openai key");
    const encryptedApiKey = encryptData(openaiKey);
    localStorage.setItem("icp-dai-open-ai", encryptedApiKey);
    toast.success("Openai key successfully saved and crypted");
    setOpenaiKey("");
  };

  return (
    <div className="wrapper">
      <div className="wrapper-header">
        <h1>HealthGuardian AI</h1>
        <button
          className="auth-button"
          onClick={() => (window.auth.isAuthenticated ? logout() : login())}
        >
          {window.auth.isAuthenticated ? "Log out" : "Login"}
        </button>
      </div>
      <div className="container">
        <div className="chat">
          {chatMessage.map((message, index) => (
            <div
              key={index}
              className={`bubble ${
                message.role === "user" ? "me" : "assistant"
              }`}
            >
              {message.content}
            </div>
          ))}
          {loading && (
            <div className="bubble assistant">
              <Loading />
            </div>
          )}
        </div>
        <div className="write">
          <input
            placeholder="Ask about your health..."
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? handleSubmit(e) : null)}
          />
          {!loading && (
            <button
              onClick={(e) => handleSubmit(e)}
              className="write-link send"
            ></button>
          )}
        </div>
      </div>
    </div>
  );
}