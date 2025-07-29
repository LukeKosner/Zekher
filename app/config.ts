export interface AnimationConfig {
  duration: number;
  ease: string;
  delays: Record<string, number>;
  transition: {
    opacity: { from: number; to: number };
    y: { from: number; to: number };
  };
}

export interface ExternalLinks {
  grokHolocaustDenial?: string;
  unescoReport?: string;
  yadVashemLexicon?: string;
  boderInterviews?: string;
  claude?: string;
  chatgpt?: string;
  claudeConnectors?: string;
}