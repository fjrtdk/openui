import { Chat } from "@/components/chat";
import { getModelConfig } from "@/lib/models";

// Read OPENAI_MODEL / OPENAI_MODELS at request time, not at build time, so one
// image works with any model list set in the container env.
export const dynamic = "force-dynamic";

export default function Home() {
  const { models, defaultModel } = getModelConfig();
  return <Chat models={models} defaultModel={defaultModel} />;
}
