"use client";
import "@openuidev/react-ui/styles/index.css";

import { OpenUIWordmark } from "@/components/openui-wordmark";
import { usePersistedModel } from "@/hooks/use-persisted-model";
import { library } from "@/lib/library";
import { modelDisplayName, modelGroup } from "@/lib/models";
import { OPENUI_LOGO, STARTERS } from "@/lib/starters";
import { ThemeProvider } from "@openuidev/intelligent-ui-library";
import {
  AgentInterface,
  fetchLLM,
  langGraphAdapter,
  langGraphMessageFormat,
  ModelSwitcher,
  type ModelOption,
  useThemeModePreference,
  WelcomeMascot,
} from "@openuidev/react-ui";
import { useMemo } from "react";

export interface ChatProps {
  /** Allowed model ids from the server (OPENAI_MODELS), default first. */
  models: string[];
  defaultModel: string;
}

export function Chat({ models, defaultModel }: ChatProps) {
  // Follows the system theme until the footer toggle is first used, then
  // remembers the choice.
  const { setPreference, mode } = useThemeModePreference();
  const [selectedModel, setSelectedModel] = usePersistedModel(models, defaultModel);

  const options = useMemo<ModelOption[]>(
    () =>
      models.map((id) => ({
        id,
        name: modelDisplayName(id),
        group: modelGroup(id),
        recommended: id === defaultModel,
      })),
    [models, defaultModel],
  );

  // The /api/chat route runs the LangGraph agent in-process and streams its
  // native `messages`-mode SSE. The chosen model id travels in the body; the
  // server checks it against its allowlist.
  const llm = useMemo(
    () =>
      fetchLLM({
        url: "/api/chat",
        streamAdapter: langGraphAdapter(),
        messageFormat: langGraphMessageFormat,
        body: { model: selectedModel },
      }),
    [selectedModel],
  );

  const switcher =
    options.length > 1 ? (
      <ModelSwitcher models={options} value={selectedModel} onValueChange={setSelectedModel} />
    ) : undefined;

  return (
    <ThemeProvider mode={mode}>
      <AgentInterface
        llm={llm}
        componentLibrary={library}
        logoUrl={OPENUI_LOGO}
        theme={{ mode }}
        starters={STARTERS}
      >
        <AgentInterface.SidebarHeader agentName={<OpenUIWordmark mode={mode} />} />
        <AgentInterface.SidebarFooter>
          <AgentInterface.ThemeModeToggle mode={mode} onModeChange={setPreference} />
        </AgentInterface.SidebarFooter>
        {switcher ? <AgentInterface.MobileHeader agentName="" logo={switcher} /> : null}
        <AgentInterface.ThreadHeader start={switcher} />
        <AgentInterface.Welcome
          image={<WelcomeMascot />}
          title="What's on your mind today?"
          starterVariant="card"
          glowAnimation
        />
      </AgentInterface>
    </ThemeProvider>
  );
}
