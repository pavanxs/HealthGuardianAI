import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { addMessageToConversation, getAllMessages } from "../utils/chat";

const HARDCODED_API_KEY = process.env.OPENAI_API_KEY;

const useApi = () => {
  const [data, setData] = useState("");
  const [chatMessage, setChatMessage] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const chatCompletion = useCallback(async (payload) => {
    const url = "https://api.openai.com/v1/chat/completions";
    setLoading(true);
    try {
      await addMessageToConversation(payload[0]);
      
      // Get all previous messages
      const allMessages = await getAllMessages(window.auth.principalText);
      
      // Prepare the messages array for the API call
      const contextMessages = allMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the system message to provide context about previous messages
      contextMessages.unshift({
        role: "system",
        content: "The following messages are previous health-related conversations. Use this information for diagnosis based on new messages."
      });
      
      // Add the new message
      contextMessages.push(payload[0]);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + HARDCODED_API_KEY,
        },
        body: JSON.stringify({
          messages: contextMessages,
          model: "gpt-4o-mini",
          temperature: 1,
        }),
      });

      const result = await response.json();

      if (response.status !== 200) {
        const message = result.error.message;
        toast.error(message);
        throw new Error(message);
      }

      const assistantContent = result.choices[0].message.content;
      const messageToSaveFromAssistant = {
        content: assistantContent,
        role: "assistant",
      };
      setChatMessage((prev) => [...prev, messageToSaveFromAssistant]);
      await addMessageToConversation(messageToSaveFromAssistant);
      setData(assistantContent);
      setError(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }, []);

  return {
    data,
    error,
    loading,
    chatCompletion,
    uploading,
    setData,
    chatMessage,
    setChatMessage,
  };
};

export default useApi;
