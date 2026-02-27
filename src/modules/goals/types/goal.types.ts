export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  deadline?: string;
}

export interface UpdateGoalRequest {
  id: string;
  name: string;
  targetAmount: number;
  deadline?: string;
  isActive: boolean;
}

export interface GoalResponse {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  isActive: boolean;
}