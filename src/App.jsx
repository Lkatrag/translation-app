import React, { useState } from "react";
import "./App.css";
import { Configuration, OpenAIApi } from "openai";
import { BeatLoader } from "react-spinners";

const App = () => {
  const [formData, setFormData] = useState({ language: "Hindi", message: "" ,model: "gpt-4"});
  const [error, setError] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const configuration = new Configuration({
    apiKey: import.meta.env.VITE_OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const translate = async () => {
    const { language, message, model } = formData;
  
    try {
      setIsLoading(true);
      const response = await openai.createChatCompletion({
        model: model,
        messages: [
          { role: "system", content: `You will be provided with a sentence in English, and your task is to translate it into ${language}.` },
          { role: "user", content: message },
        ],
        temperature: 0.3,
        max_tokens: 100,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
  
      const translatedText = response.data.choices[0].message.content.trim();
      setTranslation(translatedText);
      setIsLoading(false);
  
      // Send translation result to the backend
      await fetch('https://translation-app-m8dt.onrender.com/api/translations', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_message: message,
          translated_message: translatedText,
          language: language,
          model: model,
        }),
      });
    } catch (error) {
      console.error("Translation error:", error);
      setError("Translation failed. Please try again.");
      setIsLoading(false);
    }
  };
  

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!formData.message) {
      setError("Please enter the message.");
      return;
    }
    translate();
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(translation)
      .then(() => displayNotification())
      .catch((err) => console.error("Failed to copy:", err));
  };

  const displayNotification = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  return (
    <div className="container">
      <h1>Translation</h1>

      <form onSubmit={handleOnSubmit}>
      <div className="choices">
          <input
            type="radio"
            id="gpt-3.5-turbo"
            name="model"
            value="gpt-3.5-turbo"
            onChange={handleInputChange}
          />
          <label htmlFor="gpt-3.5-turbo">gpt-3.5</label>

          <input
            type="radio"
            id="gpt-4"
            name="model"
            value="gpt-4"
            defaultChecked={formData.model === "gpt-4"}
            onChange={handleInputChange}
          />
          <label htmlFor="gpt-4">gpt-4</label>

          <input
            type="radio"
            id="gpt-4-turbo"
            name="model"
            value="gpt-4-turbo"
            onChange={handleInputChange}
          />
          <label htmlFor="gpt-4-turbo">gpt-4-turbo</label>
        </div>
        <div className="choices">
          <input
            type="radio"
            id="hindi"
            name="language"
            value="Hindi"
            defaultChecked={formData.language === "Hindi"}
            onChange={handleInputChange}
          />
          <label htmlFor="hindi">Hindi</label>

          <input
            type="radio"
            id="spanish"
            name="language"
            value="Spanish"
            onChange={handleInputChange}
          />
          <label htmlFor="spanish">Spanish</label>

          <input
            type="radio"
            id="french"
            name="language"
            value="French"
            onChange={handleInputChange}
          />
          <label htmlFor="french">French</label>

          <input
            type="radio"
            id="telugu"
            name="language"
            value="Telugu"
            onChange={handleInputChange}
          />
          <label htmlFor="telugu">Telugu</label>

          <input
            type="radio"
            id="japanese"
            name="language"
            value="Japanese"
            onChange={handleInputChange}
          />
          <label htmlFor="japanese">Japanese</label>
        </div>

        <textarea
          name="message"
          placeholder="Type your message here.."
          onChange={handleInputChange}
        ></textarea>

        {error && <div className="error">{error}</div>}

        <button type="submit">Translate</button>
      </form>

      <div className="translation">
        <div className="copy-btn" onClick={handleCopy}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
            />
          </svg>
        </div>
        {isLoading ? <BeatLoader size={12} color={"red"} /> : translation}
      </div>

      <div className={`notification ${showNotification ? "active" : ""}`}>
        Copied to clipboard!
      </div>
    </div>
  );
};

export default App;
