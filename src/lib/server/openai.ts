import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1";

function requireApiKey() {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }
}

async function openaiFetch(path: string, body: unknown) {
  requireApiKey();

  const response = await fetch(`${OPENAI_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export function hasOpenAiApiKey() {
  return Boolean(OPENAI_API_KEY);
}

export async function createEmbedding(input: string) {
  const data = (await openaiFetch("/embeddings", {
    model: "text-embedding-3-small",
    input,
    encoding_format: "float",
  })) as {
    data?: Array<{
      embedding: number[];
    }>;
  };

  return data.data?.[0]?.embedding ?? null;
}

export async function createEmbeddings(inputs: string[]) {
  const data = (await openaiFetch("/embeddings", {
    model: "text-embedding-3-small",
    input: inputs,
    encoding_format: "float",
  })) as {
    data?: Array<{
      embedding: number[];
      index: number;
    }>;
  };

  return (data.data ?? [])
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

export async function createStructuredChatCompletion<T>({
  schema,
  name,
  system,
  user,
}: {
  schema: z.ZodType<T>;
  name: string;
  system: string;
  user: string;
}) {
  const data = (await openaiFetch("/chat/completions", {
    model: "gpt-5-nano",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          `${system}\n\n` +
          "Верни только JSON-объект, строго соответствующий ожидаемой схеме. " +
          `Имя схемы: ${name}.`,
      },
      {
        role: "user",
        content:
          `${user}\n\n` +
          `JSON schema:\n${JSON.stringify(z.toJSONSchema(schema))}`,
      },
    ],
    response_format: {
      type: "json_object",
    },
  })) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty structured completion response");
  }

  return schema.parse(JSON.parse(content));
}
