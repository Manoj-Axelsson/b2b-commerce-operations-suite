export interface SaveCustomerPayload {
  id?: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  password?: string;
}

export interface ActionResponse {
  success: boolean;
  error?: string;
}