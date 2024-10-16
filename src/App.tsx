import { FC, useState, useEffect, useRef } from 'react';
import './index.css';
import Arrow from './icons/Arrow';
import { edogsIcon, highVoltage, clickBtn, rocket, trophy, goldenCoins, snail, bone, coinBone } from './images';
import { BalanceDisplay } from './solana/BalanceDisplay';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';


const EatenCoinsAccount = 'Eatenv68bgYmpGRw3EVbYFkpTcMroM3eJKGZpLxXAmA5';
const energyLevel = 10000;
const energyInterval = 4;

const App: FC = () => {
  //const refBalanceDisplay = useRef(null)
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const pointsToAdd = useRef(2500);
  const energyStep = useRef(2500);
  const [energy, setEnergy] = useState(3500);
  const [points, setPoints] = useState(localStorage.points || 0);
  const [level, setLevel] = useState(localStorage.level || 0);
  const [boost, setBoost] = useState(1);
  const [isSendCoin, setIsSendCoin] = useState(false)
  const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);

  const handleClickSlow = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (boost > 1) {
      energyStep.current = Math.round(25 * Math.sqrt(boost - 1));
      pointsToAdd.current = 25 * (boost - 1);
      setBoost(boost - 1);
    }
  };
  const handleClickBoost = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    energyStep.current = Math.round(25 * Math.sqrt(boost + 1));
    pointsToAdd.current = 25 * (boost + 1);
    setBoost(boost + 1);
  };
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    /*if (energy + energyStep > energyLevel) {
      return;
    }*/
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    localStorage.points = parseInt(points) + pointsToAdd.current;

    const energyValue = energy + energyStep.current
    if (energyValue >= energyLevel) {
      setIsSendCoin(true);
      setEnergy(energyLevel - 1);
    } else {
      setEnergy(energy + energyStep.current);
    }
    setPoints(localStorage.points);
    setClicks([...clicks, { id: Date.now(), x, y }]);
  };

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
  };

  // useEffect hook to restore energy over time
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSendCoin) {
        setEnergy((prevEnergy) => {
          const m = Math.min(prevEnergy - energyInterval, energyLevel);
          return m > 0 ? m : 0;
        });
      }
    }, 200); // Restore 10 energy points every second

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [isSendCoin]);

  return (
    <div className="bg-gradient-main min-h-screenflex flex-col items-center text-white font-medium">

      <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="radial-gradient-overlay"></div>
      </div>
      
      <div className="absolute w-full mt-4 flex z-30">
        <div className='mx-4'>
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        </div>
        <div className="balance absolute right-4 w-34">
          <BalanceDisplay />
        </div>
      </div>

      <main className="w-full relative z-10 min-h-screen flex flex-col items-center text-white overflow-hidden">
        <div className="fixed top-0 left-0 w-full px-4 pt-8 z-10 flex flex-col items-center text-white">
          <div className="w-full cursor-pointer">
            {/*<div className="bg-[#1f1f1f] text-center py-2 rounded-xl">
              <p className="text-lg">Join squad <Arrow size={18} className="ml-0 mb-1 inline-block" /></p>
            </div>*/}
          </div>
          <div className="mt-20 -ml-10 text-5xl font-bold flex items-center">
            <img src={coinBone} width={56} />
            <span className="ml-2">{points.toLocaleString()}</span>
          </div>
          <div className="text-base mt-2 flex items-center">
            <img src={trophy} width={24} height={24} />
            <span className="ml-1">Level {level}</span>
          </div>
        </div>


        <div className="fixed bottom-0 left-0 w-full px-4 pb-4 z-10">
          <div className="w-full flex justify-between gap-2">
            <div className="w-1/3 flex items-center justify-start max-w-32">
              <div className="flex items-center justify-center">
                <img src={highVoltage} width={44} height={44} alt="Balance" title="Balance" />
                <div className="ml-2 text-left">
                  <span className="text-white text-2xl font-bold block">{energy}</span>
                  <span className="text-white text-large opacity-75">/ {energyLevel}</span>
                </div>
              </div>
            </div>
            <div className="flex-grow flex items-center max-w-60 text-sm">
              <div className="w-full bg-[#f1be27] py-4 rounded-2xl flex justify-evenly">
                <button className="flex flex-col items-center gap-1" onClick={handleClickSlow}>
                  <img src={snail} width={24} height={24} alt="Snail" />
                  <span>Slow</span>
                </button>
                <div className="h-[48px] w-[2px] bg-[#f1d127]"></div>
                <button className="flex flex-col items-center gap-1" onClick={handleClickBoost}>
                  <div className='flex flex-row items-center'>
                    <img className='mr-0.5' src={rocket} width={24} height={24} alt="Rocket" />
                    {boost > 1
                    ? 'x' + boost
                    : ''
                    }
                  </div>
                  <span>Boost</span>
                </button>
                <div className="h-[48px] w-[2px] bg-[#f1d127]"></div>
                <a className="flex flex-col items-center gap-1" href='https://raydium.io/swap/?inputMint=sol&outputMint=mnt6Lp5aBWL6FD5QJx3CADTsqrs2vRjHGze6XtidDka' target='_blank'>
                  <img src={edogsIcon} width={24} height={24} alt="EDogs" />
                  <span>Buy</span>
                </a>
              </div>
            </div>
          </div>
          <div className="w-full bg-[#f9c035] rounded-full mt-4">
            <div className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] h-4 rounded-full" style={{ width: `${(energy / energyLevel) * 100}%` }}></div>
          </div>
        </div>


        <div className="flex-grow flex items-center justify-center opacity-80">
          <div className="relative mt-4" onClick={handleClick}>
            <img src={clickBtn} width={256} height={256} alt="clickBtn" />
            {clicks.map((click) => (
              <div
                key={click.id}
                className="absolute text-5xl font-bold opacity-0 whitespace-nowrap flex align-items"
                style={{
                  top: `${click.y - 42}px`,
                  left: `${click.x - 60}px`,
                  animation: `float 1s ease-out`
                }}
                onAnimationEnd={() => handleAnimationEnd(click.id)}
              >
                <img className='mr-2' src={bone} alt='' width='54'/>
                {pointsToAdd.current}
              </div>
            ))}
          </div>
        </div>

      </main>
      <div className={(connection && publicKey ? "" : "active") + " block-display flex items-center justify-center rounded-xl"}>
        <div className="block-display-content text-center m-4">
          <img className='w-full rounded-t-xl' src={goldenCoins} />
          <div className='p-4 mb-2 bg-gradient-to-b from-[#060605] to-50%'>
            <p>
              <b>
                The most honest tap clicker. Click and eat coins!
              </b>
            </p>
            <p>
              Buy <span className='text-[#b1ccff]'>$EDogs</span> on <a target='_blank' href='https://raydium.io/swap/?inputMint=sol&outputMint=mnt6Lp5aBWL6FD5QJx3CADTsqrs2vRjHGze6XtidDka' className='underline '>Radium DEX</a>
            </p>
            <br />
            <p>
              Fix your levels by sending eaten coins to a special fixation account,
              where they will always be as long as the blockchain exists.
            </p>
            <br />
            <p>
              Eaten and fixed coins are withdrawn from circulation,
              and the price of the <span className='text-[#b1ccff]'>$EDogs</span> coin increases.
            </p>
            <br />
            <p className='flex items-center justify-center'>
              <svg className='mr-4' height="64px" width="64px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 366.636 366.636" xmlSpace="preserve">
                <g>
                  <g>
                    <polygon fill="#FFB819" points="7.261,366.636 230.796,262.472 109.313,142.129 "/>
                    <circle fill="#FFD26C" cx="139.46" cy="232.5" r="27.121"/>
                    <path fill="#FFD26C" d="M64.791,240.073c7.507,0.439,15.158-2.219,20.866-7.982c10.454-10.552,10.455-27.525,0.076-38.087
                      L64.791,240.073z"/>
                    <path fill="#FFD26C" d="M34.985,337.966c-5.319,5.371-7.93,12.403-7.847,19.408l44.797-20.876
                      C61.238,327.277,45.076,327.78,34.985,337.966z"/>
                    <path fill="#FFD26C" d="M142.845,283.129c-6.434,6.495-8.903,15.423-7.436,23.792l47.484-22.127
                      c-0.534-0.634-1.093-1.252-1.693-1.846C170.559,272.407,153.387,272.488,142.845,283.129z"/>
                    <circle fill="#FFD26C" cx="77.177" cy="286.451" r="27.121"/>
                    <polygon fill="#004D7A" points="96.306,170.743 202.305,275.748 230.796,262.472 109.313,142.129 		"/>
                  </g>
                  <circle fill="#00BCB4" cx="135" cy="86.679" r="18.497"/>
                  <circle fill="#00BCB4" cx="276.53" cy="235.558" r="18.497"/>
                  <circle fill="#FFB819" cx="316.74" cy="153.038" r="18.497"/>
                  <circle fill="#FFB819" cx="176.102" cy="18.497" r="18.497"/>
                  <circle fill="#D85C72" cx="228.315" cy="181.419" r="18.497"/>
                  <circle fill="#D85C72" cx="239.536" cy="74.687" r="18.497"/>
                  <circle fill="#D85C72" cx="334.385" cy="83.179" r="18.497"/>
                  <path fill="#00BCB4" d="M133.624,143.693c-3.767,0-6.819-3.053-6.819-6.819c0-3.766,3.052-6.819,6.819-6.819
                    c25.377,0,46.024-20.646,46.024-46.024c0-32.898,26.764-59.662,59.662-59.662c32.897,0,59.661,26.764,59.661,59.662
                    c0,3.766-3.053,6.818-6.818,6.818c-3.765,0-6.818-3.052-6.818-6.818c0-25.378-20.647-46.024-46.024-46.024
                    c-25.378,0-46.024,20.646-46.024,46.024C193.285,116.929,166.52,143.693,133.624,143.693z"/>
                  <path fill="#FFB819" d="M312.259,210.037c-25.978,0-47.115-21.136-47.115-47.115c0-18.459-15.019-33.479-33.478-33.479
                    c-18.46,0-33.479,15.019-33.479,33.479c0,3.766-3.053,6.818-6.817,6.818c-3.767,0-6.819-3.052-6.819-6.818
                    c0-25.979,21.136-47.115,47.115-47.115c25.979,0,47.115,21.136,47.115,47.115c0,18.46,15.018,33.478,33.478,33.478
                    s33.478-15.018,33.478-33.478c0-3.766,3.054-6.818,6.82-6.818c3.764,0,6.817,3.052,6.817,6.818
                    C359.375,188.901,338.239,210.037,312.259,210.037z"/>
                </g>
              </svg>
              <b>
                It's very simple!!!
              </b>
            </p>
            <div className='text-xs mt-6 text-gray-400'>
              * $EDogs is a meme token based on the Solana blockchain with no intrinsic value or expectation of financial return.
              There is no formal team or roadmap
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
