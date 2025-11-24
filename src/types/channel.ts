export interface Channel {
  id: string;
  name: string;
  accessKey: string;
  members: string[];
  expenses: Expense[];
  createdAt: string;
  lastActivityAt: string;
}

export interface Expense {
  id: number;
  itemName: string;
  amount: number;
  payer: string;
  participants: string[];
  createdAt?: string;
}
