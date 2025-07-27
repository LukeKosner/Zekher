// Shared orchestrator utilities for both frontend and backend
// This ensures consistent question classification and step planning

export type OrchestratorScenario = "personal" | "factual" | "unclear";

export interface StepPlan {
  stepNumber: number;
  stepName: string;
  description: string;
  toolName?: string;
}

/**
 * Classify user query intent to determine orchestrator scenario
 */
export function classifyQueryIntent(userText: string): OrchestratorScenario {
  const q = userText.toLowerCase();
  
  // Intent classification logic
  const isPersonal = /survivor|testimon|story|stories|experience|personal|account|lived|felt|life|daily|family|remember/.test(q);
  const isFactual = /what|when|where|who|how many|how much|define|describe|history|historical|facts|explain|tell me about/.test(q);
  
  // Special handling for survivor experience queries - prioritize personal
  if (isPersonal && /survivor.*experience|experience.*survivor/.test(q)) {
    return "personal";
  }
  
  if (isPersonal && !isFactual) {
    return "personal";
  } else if (isFactual && !isPersonal) {
    return "factual";
  } else if (isPersonal && isFactual) {
    return "factual"; // default to factual if mixed
  } else {
    return "unclear";
  }
}

/**
 * Get the maximum step count for a given scenario
 */
export function getMaxSteps(scenario: OrchestratorScenario): number {
  switch (scenario) {
    case "personal":
      return 3; // 0: testimony, 1: answer, 2: audio
    case "factual":
      return 4; // 0: lexicon, 1: answer, 2: testimony, 3: audio
    case "unclear":
      return 4; // default to factual flow
    default:
      return 4;
  }
}

/**
 * Get the complete step plan for a given scenario
 */
export function getStepPlan(scenario: OrchestratorScenario): StepPlan[] {
  switch (scenario) {
    case "personal":
      return [
        {
          stepNumber: 0,
          stepName: "Search Testimonies",
          description: "Finding relevant survivor accounts",
          toolName: "testimonyTool"
        },
        {
          stepNumber: 1,
          stepName: "Provide Answer",
          description: "Crafting empathetic response based on testimonies"
        },
        {
          stepNumber: 2,
          stepName: "Show Audio",
          description: "Presenting relevant audio segments",
          toolName: "showUsersAudio"
        }
      ];
    
    case "factual":
      return [
        {
          stepNumber: 0,
          stepName: "Search Holocaust Lexicon",
          description: "Gathering facts from Yad Vashem",
          toolName: "lexiconTool"
        },
        {
          stepNumber: 1,
          stepName: "Provide Answer",
          description: "Delivering comprehensive factual response"
        },
        {
          stepNumber: 2,
          stepName: "Search Testimonies",
          description: "Finding personal accounts related to the topic",
          toolName: "testimonyTool"
        },
        {
          stepNumber: 3,
          stepName: "Show Audio",
          description: "Presenting relevant audio segments",
          toolName: "showUsersAudio"
        }
      ];
    
    case "unclear":
    default:
      // Default to factual flow for unclear queries
      return [
        {
          stepNumber: 0,
          stepName: "Search Lexicon",
          description: "Gathering historical information",
          toolName: "lexiconTool"
        },
        {
          stepNumber: 1,
          stepName: "Provide Answer",
          description: "Delivering response and clarification"
        },
        {
          stepNumber: 2,
          stepName: "Search Testimonies",
          description: "Finding relevant personal accounts",
          toolName: "testimonyTool"
        },
        {
          stepNumber: 3,
          stepName: "Show Audio",
          description: "Presenting audio segments",
          toolName: "showUsersAudio"
        }
      ];
  }
}

/**
 * Get user-friendly scenario name
 */
export function getScenarioDisplayName(scenario: OrchestratorScenario): string {
  switch (scenario) {
    case "personal":
      return "Personal Experience Query";
    case "factual":
      return "Factual Historical Query";
    case "unclear":
      return "General Query";
    default:
      return "Query";
  }
}