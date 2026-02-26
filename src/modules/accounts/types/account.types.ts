export interface CreateAccountRequest {
  name: string
  type: AccountType
  initialBalance: number
}

export interface UpdateAccountRequest {
  id: string
  name: string
  type: AccountType
  isActive: boolean
}

export interface AccountResponse {
  id: string
  name: string
  type: AccountType
  initialBalance: number
  isActive: boolean
}

export enum AccountType {
  Checking,
  Wallet,
  CreditCard,
  Investment,
}
