export type UserRole = 'admin' | 'child';
export type TaskStatus = 'Pending' | 'InReview' | 'Approved' | 'Rejected';
export type TaskType = 'hogar' | 'deberes' | 'comportamiento' | 'responsabilidad';
export type TaskFrequency = 'OneTime' | 'Daily' | 'Weekly';
export type TransactionType = 'TaskReward' | 'Penalty' | 'RewardRedeemed';
export type RewardRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AuthUser {
  userId: number;
  role: UserRole;
  familyId: string;
}
