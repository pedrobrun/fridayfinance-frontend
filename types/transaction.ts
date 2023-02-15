export default interface Transaction {
  id: string;
  accountId: string;
  categoryId?: string;
  reference?: string;
  amount: number;
  currency: string;
  date: Date;
}
