import tokenManager from "@/services/tokenManager";

export interface Challenge {
  id: number;
  name: string;
  description: string;
  goal_quantity: string;
  unit: string | null;
  target_category: number | null;
  target_subcategory: number | null;
  start_date: string;
  end_date: string;
  entry_type: "individual" | "team" | "open";
  template: number | null;
  creator: number;
  created_at: string;
  participants_count: number;
}

export interface ChallengeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Challenge[];
}

export type ChallengeStatus = "active" | "upcoming" | "past";

export const getChallengeStatus = (
  challenge: Pick<Challenge, "start_date" | "end_date">,
  referenceDate: Date = new Date()
): ChallengeStatus => {
  const now = new Date(referenceDate);
  now.setHours(0, 0, 0, 0);

  const start = new Date(challenge.start_date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(challenge.end_date);
  end.setHours(23, 59, 59, 999);

  if (now < start) return "upcoming";
  if (now > end) return "past";
  return "active";
};

export interface ChallengeParticipation {
  id: number;
  user: string;
  challenge: string;
  team: string | null;
  progress: number;
  status: string;
  joined_at: string;
  completed_at: string | null;
  exited_at: string | null;
}

const CHALLENGES_ENDPOINT = "/api/v1/challenges/api/v1/challenges/";

const parseJson = async <T>(response: Response, fallbackMessage: string): Promise<T> => {
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && (data.detail || data.message || data.error)) ||
      fallbackMessage ||
      "Request failed";
    throw new Error(typeof message === "string" ? message : fallbackMessage);
  }

  return data as T;
};

export const getChallenges = async (): Promise<ChallengeListResponse> => {
  const response = await tokenManager.authenticatedFetch(CHALLENGES_ENDPOINT);
  return parseJson<ChallengeListResponse>(response, "Failed to load challenges.");
};

export const getChallengeById = async (id: number): Promise<Challenge> => {
  const response = await tokenManager.authenticatedFetch(`${CHALLENGES_ENDPOINT}${id}/`);
  return parseJson<Challenge>(response, "Failed to load challenge details.");
};

export const joinChallenge = async (id: number): Promise<ChallengeParticipation> => {
  const response = await tokenManager.authenticatedFetch(
    `/api/v1/challenges/api/v1/challenges/${id}/join/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }
  );
  return parseJson<ChallengeParticipation>(response, "Unable to join the challenge.");
};

export const leaveChallenge = async (id: number): Promise<void> => {
  const response = await tokenManager.authenticatedFetch(
    `/api/v1/challenges/api/v1/challenges/${id}/leave/`,
    {
      method: "DELETE",
    }
  );
  await parseJson<null>(response, "Unable to leave the challenge.");
};