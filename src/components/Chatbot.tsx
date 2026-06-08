"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import styles from "@/styles/Chatbot.module.scss";

const PROMPTS = [
  "How to Enroll in courses?",
  "Whats best courses for me?",
  "What are the new courses?",
];

const BOT_AVATAR = "/favicon.ico";

type Message = {
  from: "bot" | "user";
  text: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [chat, setChat] = useState<Message[]>([
    {
      from: "bot",
      text: "Hi! How can I help you today?",
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();

      if (!q || isProcessing) return;

      setChat((prev) => [...prev, { from: "user", text: q }]);
      setIsProcessing(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: q,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error("Request failed");
        }

        setChat((prev) => [
          ...prev,
          {
            from: "bot",
            text:
              data?.answer || "I couldn't generate a reply. Please try again.",
          },
        ]);
      } catch {
        setChat((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Oops, something went wrong. Please try again later.",
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = input.trim();

    if (!value || isProcessing) return;

    setInput("");
    await ask(value);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Toggle chatbot"
        title="Chat with SkillBlade Assistant"
        className={styles.chatBtn}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Image
          src={"/favicon.ico"}
          alt="SkillBlade Assistant"
          width={40}
          height={40}
        />
      </button>

      {open && (
        <div ref={chatBoxRef} className={`${styles.chatBox} ${styles.open}`}>
          <nav className={styles.header}>
            <div className={styles.brand}>
              <div className={styles.brandAvatar} aria-hidden>
                <Image
                  src={BOT_AVATAR}
                  alt="SkillBlade Assistant"
                  width={40}
                  height={40}
                />
              </div>

              <div className={styles.brandText}>
                <span className={styles.brandName}>SkillBlade Assistant</span>

                <span className={styles.brandStatus}>
                  <span className={styles.statusDot} />
                  Online
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close chatbot"
              title="Close"
              className={styles.closeButton}
              onClick={() => setOpen(false)}
            >
              X
            </button>
          </nav>

          <div className={styles.history} role="log" aria-live="polite">
            {chat.map((msg, index) => (
              <div
                key={`${msg.from}-${index}`}
                className={`${styles.message} ${
                  msg.from === "user" ? styles.user : styles.bot
                }`}
              >
                {msg.from === "bot" && (
                  <div className={styles.avatar} aria-hidden>
                    <Image src={BOT_AVATAR} alt="" width={28} height={28} />
                  </div>
                )}

                <div className={styles.bubble}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: (props) => <span {...props} />,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.avatar} aria-hidden>
                  <Image
                    src={BOT_AVATAR}
                    alt="SkillBlade Assistant"
                    width={40}
                    height={40}
                  />
                </div>

                <div
                  className={`${styles.bubble} ${styles.typing}`}
                  aria-label="Assistant is typing"
                >
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {chat.length === 1 && (
            <div className={styles.prompts}>
              {PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => ask(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form className={styles.inputArea} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              disabled={isProcessing}
              className={styles.textInput}
              aria-label="Message"
              placeholder={isProcessing ? "Thinking..." : "Ask Anything"}
              onChange={(e) => setInput(e.target.value)}
            />

            <button
              type="submit"
              aria-label="Send message"
              className={styles.sendButton}
              disabled={isProcessing || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
