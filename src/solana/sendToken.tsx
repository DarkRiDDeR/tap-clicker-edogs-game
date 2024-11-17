import {
    Connection,
    Transaction,
    PublicKey,
  } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Wallet } from "@solana/wallet-adapter-react";

/*declare global {
  interface ISendResult {
    success: boolean,
    value: Promise<string> | string
  }
}*/

const sendToken = async (
  connection: Connection,
  wallet: Wallet,
  fromAccPB: PublicKey,
  toAccPB: PublicKey,
  mint: PublicKey,
  amount: number,
  tokenProgram: PublicKey = TOKEN_2022_PROGRAM_ID
) => {
  try {
    const fromTokenAcc = await getAssociatedTokenAddress(mint, fromAccPB, false, tokenProgram)
    const toTokenAcc = await getAssociatedTokenAddress(mint, toAccPB, false, tokenProgram)

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAcc,
        toTokenAcc,
        fromAccPB,
        amount,
        [],
        tokenProgram
      ),
    );
    
    return {
      success: true,
      value: await wallet.adapter.sendTransaction(transaction, connection)
    }
  } catch ( _e ) {
    let message =(_e as Error).message
    return {success: false, value: message.toString()}
  }
};

export default sendToken;