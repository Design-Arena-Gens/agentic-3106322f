"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Message, MessageBubble } from "./components/MessageBubble";
import { PromptComposer } from "./components/PromptComposer";
import { ThinkingIndicator } from "./components/ThinkingIndicator";

const introMessage: Message = {
  id: "intro",
  role: "assistant",
  content:
    "Привет! Я DeepThink — агентный чат с интерфейсом и ощущением ChatGPT. Я делюсь явными шагами рассуждений, подключаюсь к веб-поиску на лету и формирую ответы в живом стиле. Спроси что угодно и наблюдай за процессом.",
  thoughts: [
    "Готовлю рабочую поверхность интерфейса",
    "Активация пайплайна поиска и резюмирования",
    "Ожидаю пользовательский запрос"
  ]
};

const localStorageKey = "deepthink-session";

type StoredSession = {
  messages: Message[];
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([introMessage]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(localStorageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as StoredSession;
      if (parsed?.messages?.length) {
        setMessages(parsed.messages);
      }
    } catch (error) {
      console.error("Failed to restore chat history", error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(localStorageKey, JSON.stringify({ messages } satisfies StoredSession));
  }, [messages]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const pushMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSubmit = useCallback(
    async (input: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: input
      };

      pushMessage(userMessage);
      setBusy(true);

      const thinkingMessageId = crypto.randomUUID();
      pushMessage({
        id: thinkingMessageId,
        role: "thinking",
        content: "Вхожу в глубинный режим размышлений..."
      });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(({ role, content }) => ({
              role,
              content
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const payload = await response.json();

        setMessages((prev) =>
          prev
            .filter((message) => message.id !== thinkingMessageId)
            .concat({
              id: crypto.randomUUID(),
              role: "assistant",
              content: payload.reply as string,
              sources: payload.sources,
              thoughts: payload.thoughts
            })
        );
      } catch (error) {
        console.error(error);
        setMessages((prev) =>
          prev
            .filter((message) => message.id !== thinkingMessageId)
            .concat({
              id: crypto.randomUUID(),
              role: "assistant",
              content:
                "Кажется, возникла проблема с доступом к веб-поиску. Попробуй ещё раз или измени формулировку запроса.",
              thoughts: [
                "Проверяю сетевое соединение",
                "Получаю ошибку от внешнего API",
                "Отправляю пользователю уведомление о сбое"
              ]
            })
        );
      } finally {
        setBusy(false);
      }
    },
    [messages, pushMessage]
  );

  const layoutMessages = useMemo(
    () =>
      messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      )),
    [messages]
  );

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-10 md:px-10">
        <header className="mx-auto flex w-full max-w-4xl flex-col gap-3 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-semibold tracking-tight"
          >
            DeepThink Agent Chat
          </motion.h1>
          <motion.p
            className="text-white/60"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          >
            Наблюдай за явным ходом мыслей, живой анимацией и подключениями к вебу как в ChatGPT с Deep Research.
          </motion.p>
        </header>

        <div
          ref={scrollRef}
          className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 overflow-y-auto rounded-3xl border border-white/5 bg-black/20 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <div className="flex flex-col gap-4">{layoutMessages}</div>

          {busy && (
            <div className="mt-2">
              <ThinkingIndicator />
            </div>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <PromptComposer onSubmit={handleSubmit} disabled={busy} />
          <div className="text-xs text-white/40">
            DeepThink автоматически выполняет целевые запросы в сети и строит рассуждения перед ответом. Источники и
            трассировки доступны в карточках ответов.
          </div>
        </div>
      </div>
    </main>
  );
}
