import { Application } from ".";

export enum TRANSACTION_TYPE {
  fund = 0,
  withdraw = 1,
  transfer = 2,
}

export const TRANSACTION_TYPE_MAP: Record<TRANSACTION_TYPE, string> = {
  "0": "Fund Wallet",
  "1": "Withdraw from wallet",
  "2": "Transfer to another wallet",
};

export const fundAccount = async (
  app: Application,
  amount: number,
  narration: string
) => {
  const response = await app.initiateNetworkRequest(
    "/account/fund",
    {
      method: "POST",
      body: JSON.stringify({ amount: amount * 100, narration }),
    },
    true
  );

  if (!response.ok) {
    throw new Error((await response.json())?.message);
  }

  return await response.json();
};

export const withdrawFunds = async (
  app: Application,
  amount: number,
  narration: string
) => {
  const response = await app.initiateNetworkRequest(
    "/account/withdraw",
    {
      method: "POST",
      body: JSON.stringify({ amount: amount * 100, narration }),
    },
    true
  );

  if (!response.ok) {
    throw new Error((await response.json())?.message);
  }

  return await response.json();
};

export const transferFunds = async (
  app: Application,
  amount: number,
  narration: string,
  recipient: string
) => {
  const response = await app.initiateNetworkRequest(
    "/account/transfer",
    {
      method: "POST",
      body: JSON.stringify({ amount: amount * 100, narration, recipient }),
    },
    true
  );

  if (!response.ok) {
    throw new Error((await response.json())?.message);
  }

  return await response.json();
};
