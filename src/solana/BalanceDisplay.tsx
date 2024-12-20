import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import { edogsIcon, solIcon } from "../images";


export const BalanceDisplay: FC<{tokenPB: PublicKey, txid: string}> = ({tokenPB, txid}) => {
  const [balance, setBalance] = useState(0);
  const [balanceToken, setBalanceToken] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    console.log(txid)

    const updateBalance = async () => {
      if (connection && publicKey) {
        //console.error("Wallet not connected or connection unavailable");

        try {
          /*connection.onAccountChange(
            publicKey,
            updatedAccountInfo => {
              setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
              //setBalanceEDogs(3423)
            },
            "confirmed",
          );*/

          /*const accountInfo = await connection.getAccountInfo(publicKey);
          if (accountInfo) {
            setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
          } else {
            throw new Error("Account info not found");
          }*/
          let balance = await connection.getBalance(publicKey);
          balance = Math.round(balance / LAMPORTS_PER_SOL * 1000) / 1000;
          setBalance(balance)

          const response = await connection.getParsedTokenAccountsByOwner(publicKey, {mint: tokenPB})
          setBalanceToken(Math.round(response.value[0].account.data.parsed.info.tokenAmount.uiAmount))
        } catch (error) {
          console.error("Failed to retrieve balance info:", error);
        }
      }
    };

    updateBalance();
  }, [connection, publicKey, txid]);

  if (!publicKey) {
    return ''
  } else {
    return (
      <div className="text-sm">
        <div className="flex items-center mb-2">
          <div className="h-6 w-6 mr-2 bg-white rounded-full flex items-center justify-center"><img src={solIcon} width={16} height={16} /></div>{balance} Sol
        </div>
        <div className="flex items-center">
          <img className="mr-2 h-6 w-6" src={edogsIcon} />
          {balanceToken} Edogs
        </div>
      </div>
    )
  }
};