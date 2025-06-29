"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Category {
  title: string;
  description: string;
  prompts: string[];
}

const categories: Category[] = [
  {
    title: "Setup & Installation",
    description: "Get help with initial setup and configuration",
    prompts: [
      "How to properly set up the .env file?",
      "What Node.js version should I use?",
      "How to resolve pnpm build errors?",
      "How to set up social media integration?",
    ],
  },
  {
    title: "Agent Configuration",
    description: "Learn how to configure and customize your agent",
    prompts: [
      "How to configure bot responses?",
      "How to control tweet frequency?",
      "How to manage agent memory?",
      "How to implement custom actions?",
    ],
  },
  {
    title: "API & Models",
    description: "Understand AI models and API integration",
    prompts: [
      "Which AI models are recommended?",
      "How to handle API keys and rate limits?",
      "How to switch between model providers?",
      "What are the costs for different models?",
    ],
  },
  {
    title: "Development",
    description: "Resources for developers and contributors",
    prompts: [
      "How to implement new features?",
      "Where to find documentation?",
      "How to handle database issues?",
      "Best practices for contributing?",
    ],
  },
];

export default function Page() {
  const router = useRouter();
  const [userEntity, setUserEntity] = useState<string | null>(null);

  // Initialize user entity on client side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEntity = localStorage.getItem("elizaHowUserEntity");
      if (storedEntity) {
        setUserEntity(storedEntity);
      } else {
        const newEntity = uuidv4();
        localStorage.setItem("elizaHowUserEntity", newEntity);
        setUserEntity(newEntity);
      }
    }
  }, []);

  const createNewSession = useCallback(
    async (initialMessage: string) => {
      if (!userEntity) {
        console.error("User entity not available");
        return;
      }

      try {
        console.log(
          `[Explore] Creating new session with message: "${initialMessage}"`,
        );

        const response = await fetch("/api/chat-session/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userEntity,
            initialMessage: initialMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create session");
        }

        const result = await response.json();
        const sessionId = result.data.sessionId;

        console.log(`[Explore] Created new session: ${sessionId}`);

        // Navigate to the new session
        router.push(`/chat/${sessionId}`);
      } catch (error) {
        console.error("[Explore] Failed to create new session:", error);
      }
    },
    [userEntity, router],
  );

  const handlePromptSelect = (prompt: string) => {
    if (userEntity) {
      createNewSession(prompt);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Explore</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div
            key={category.title}
            className={clsx([
              "p-5 rounded-lg",
              "border border-zinc-200 dark:border-zinc-800",
              "bg-white dark:bg-zinc-900",
            ])}
          >
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-2">
              <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {category.description}
              </p>
            </div>
            <div className="space-y-2">
              {category.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handlePromptSelect(prompt)}
                  className={clsx([
                    "w-full text-left py-2 rounded-lg cursor-pointer",
                    "text-sm",
                    "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                    "transition-colors",
                  ])}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
