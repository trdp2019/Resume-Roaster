export interface CritiqueRequest {
  resumeText: string;
  filename: string;
}

export interface CritiqueResponse {
  critique: string;
  score: number;
  roastLevel: "mild" | "medium" | "spicy" | "nuclear";
}
