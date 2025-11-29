export interface Channel {
  id: string;
  name: string;
  accessKey: string;
  members: string[];
  expenses: Expense[];
  createdAt: string;
  lastActivityAt: string;
}

// 品項（明細模式使用）
export interface ExpenseItem {
  id: string;
  name: string; // 品項名稱
  price: number; // 金額
  claimedBy: string[]; // 認領人清單（可多人）
  createdBy?: string; // 建立者（選用）
}

// 支出
export interface Expense {
  id: number;
  itemName: string;
  amount: number;
  payer: string;
  createdAt?: string;

  // 新增：模式標記（可選，預設為 "split"）
  mode?: "split" | "itemized";

  // 平分模式使用（保留原有）
  participants?: string[];

  // 明細模式使用（新增）
  items?: ExpenseItem[];
  remainderHandling?: "payer" | "split-all";
}
