import { NextResponse } from "next/server";

type Message = {
  role: "assistant" | "user" | "system" | "thinking";
  content: string;
};

type DuckDuckGoTopic = {
  Text: string;
  FirstURL: string;
  Result?: string;
};

type DuckDuckGoResponse = {
  Abstract?: string;
  AbstractURL?: string;
  Heading?: string;
  RelatedTopics?: Array<DuckDuckGoTopic | { Name: string; Topics: DuckDuckGoTopic[] }>;
};

async function searchWeb(query: string) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&no_redirect=1`; // DuckDuckGo Instant Answer API
  const response = await fetch(url, {
    headers: {
      "User-Agent": "DeepThink-Agent/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`);
  }

  const json = (await response.json()) as DuckDuckGoResponse;

  const topics: DuckDuckGoTopic[] = [];

  if (json.Abstract && json.AbstractURL) {
    topics.push({ Text: json.Abstract, FirstURL: json.AbstractURL });
  }

  json.RelatedTopics?.forEach((topic) => {
    if ("Topics" in topic) {
      topic.Topics.forEach((nested) => {
        if (nested.Text && nested.FirstURL) {
          topics.push(nested);
        }
      });
    } else if (topic.Text && topic.FirstURL) {
      topics.push(topic);
    }
  });

  return topics.slice(0, 6);
}

function generateThoughts(query: string, sources: DuckDuckGoTopic[]) {
  const thoughts: string[] = [];
  thoughts.push(`Формулирую стратегии поиска для запроса: «${query}».`);
  if (sources.length > 0) {
    thoughts.push(`Нахожу ${sources.length} релевантных источников, запускаю агрегацию сигналов.`);
    const top = sources[0];
    thoughts.push(`Извлекаю ключевые факты из: ${cleanText(top.Text).slice(0, 120)}…`);
  } else {
    thoughts.push("Прямые факты не найдены, строю ответ из базовых знаний.");
  }
  thoughts.push("Собираю конспект и вшиваю ссылки на источники.");
  return thoughts;
}

function cleanText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function craftAnswer(query: string, sources: DuckDuckGoTopic[]) {
  if (sources.length === 0) {
    return `Я не нашёл свежих результатов по запросу «${query}». Попробуй уточнить, добавить контекст или конкретные ключевые слова.`;
  }

  const distilled = sources.slice(0, 3).map((topic) => cleanText(topic.Text));
  const overview =
    distilled.length > 0
      ? `Вот что удалось собрать по теме «${query}»:\n\n${distilled
          .map((text, index) => `${index + 1}. ${text}`)
          .join("\n")}`
      : `Информации по «${query}» немного, но я нашёл несколько точек опоры.`;

  const guidance =
    sources.length > 3
      ? "Дополнительно я сохранил ещё несколько ссылок в блоке источников, чтобы можно было углубиться."
      : "Все найденные сигналы уже встроены в ответ и перечислены ниже.";

  return `${overview}\n\n${guidance}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { messages: Message[] };
    const userMessage = body.messages.reverse().find((message) => message.role === "user");

    if (!userMessage) {
      return NextResponse.json(
        { error: "No user message supplied" },
        { status: 400 }
      );
    }

    const query = userMessage.content;
    const sources = await searchWeb(query);

    const reply = craftAnswer(query, sources);
    const thoughts = generateThoughts(query, sources);

    const formattedSources = sources.map((source) => ({
      title: cleanText(source.Text).slice(0, 80) || source.FirstURL,
      url: source.FirstURL,
      snippet: cleanText(source.Text)
    }));

    return NextResponse.json({
      reply,
      thoughts,
      sources: formattedSources
    });
  } catch (error) {
    console.error("chat api error", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
