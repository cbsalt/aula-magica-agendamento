export interface ITeacher {
  id: string;
  name: string;
  email: string;
  photo?: string;
  description?: string;
  price: number;
  currency: string;
  paymentConfig?: {
    defaultMethod: string;
  };
}
