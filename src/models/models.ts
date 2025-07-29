

export interface Group {
  id: string;
  groupName: string;
  memberIds: string[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  date: any;
  splitWith: string[];
}

export interface Settlement {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
}
