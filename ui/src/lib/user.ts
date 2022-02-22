export class User {
  id: string;
  token: string;
  email: string;
  username: string;
  balance: number;

  constructor(data) {
    this.token = data.token;
    this.email = data.email;
    this.username = data.username;
    this.balance = data.balance;
    this.id = data.id;
  }
}
