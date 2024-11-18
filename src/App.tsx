import { FC, useState, useEffect, useRef } from 'react'
import './index.css'
import '@solana/wallet-adapter-react-ui/styles.css'
import { edogsIcon, highVoltage, clickBtn, rocket, trophy, goldenCoins, snail, bone, coinBone } from './images'
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey } from '@solana/web3.js'
import { BalanceDisplay } from './solana/BalanceDisplay'
import sendToken from './solana/sendToken'
import { Clipboard } from './Clipboard'

interface IError {
  title: string,
  text: string
}

const mintAddr = "mnt6Lp5aBWL6FD5QJx3CADTsqrs2vRjHGze6XtidDka";
const mintPB = new PublicKey(mintAddr);
const mintDecimals = 1000000; // min 0,000001
const freezAddr= 'Eatenv68bgYmpGRw3EVbYFkpTcMroM3eJKGZpLxXAmA5';
const freezPB= new PublicKey(freezAddr);
const energyLevel = 6500;
const energyInterval = 4;

const App: FC = () => {
  //const refBalanceDisplay = useRef(null)
  const { connection } = useConnection()
  const { publicKey, wallet } = useWallet()
  const isWalletConnected = () => connection && publicKey

  const pointsToAdd = useRef(48);
  const energyStep = useRef(48);
  
  const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);
  const [energy, setEnergy] = useState(2000);
  const [points, setPoints] = useState(localStorage.points || 0);
  const [activePoints, setActivePoints] = useState(0);
  const [level, setLevel] = useState(localStorage.level || 0);
  const [boost, setBoost] = useState(1);
  const [isStop, setIsStop] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [txid, setTxid] = useState('')
  const [error, setError] = useState<IError | null>(null)

  const handleClickSlow = () => {
    if (boost > 1) {
      energyStep.current = Math.round(25 * Math.sqrt(boost - 1))
      pointsToAdd.current = 25 * (boost - 1)
      setBoost(boost - 1)
    }
  };
  const handleClickBoost = () => {
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
    setPoints(localStorage.points);
    setActivePoints(activePoints + pointsToAdd.current)
    setClicks([...clicks, { id: Date.now(), x, y }]);

    const energyValue = energy + energyStep.current
    if (energyValue >= energyLevel) {
      setIsStop(true);
      setEnergy(energyLevel);
      setIsLoading(true);
      if (wallet && publicKey && isWalletConnected()) {
        (async () => {
          let result = await sendToken(connection, wallet, publicKey, freezPB, mintPB, activePoints * mintDecimals)
          if (result.success) {
            localStorage.level = parseInt(level) + 1;
            setLevel(localStorage.level);
            setTxid(result.value)
          } else {
            setError({title: 'Transaction confirmation and level up error', text: result.value})
          }
          setIsLoading(false)
        })()
      }
    } else {
      setEnergy(energy + energyStep.current);
    }
  };

  const handleClickOkLevelWin = () => { 
    setTxid('')
    setIsStop(false)
    setEnergy(2000)
    setActivePoints(0)
  }
  const handleClickOkError = () => { 
    setError(null)
    setIsStop(false)
  }

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
  };

  // useEffect hook to restore energy over time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isWalletConnected() && !isStop) {
        setEnergy((prevEnergy) => {
          const m = Math.min(prevEnergy - energyInterval, energyLevel);
          return m > 0 ? m : 0;
        });
      }
    }, 200); // Restore 10 energy points every second

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [isStop, isWalletConnected]);

  return (
    <div className="bg-gradient-main min-h-screenflex flex-col items-center text-white font-medium">

      <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="radial-gradient-overlay"></div>
      </div>
      
      <div className="absolute w-full mt-4 flex z-30">
        <div className={'wallet mx-4 ease-in-out duration-300' + (connection && publicKey ? ' active' : '')}>
          <WalletModalProvider>
            <WalletMultiButton />
          </WalletModalProvider>
        </div>
        <div className="balance absolute right-4 w-34">
          <BalanceDisplay tokenPB={mintPB} txid={txid}/>
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
            <span className="ml-1">Level <b>{level}</b></span>
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
      <div className={(isWalletConnected() ? "" : "active") + " block-display flex items-center justify-center z-20"}>
        <div className="block-display-content rounded-lg text-center m-4">
          <img className='w-full rounded-t-xl' src={goldenCoins} />
          <div className='p-4 mb-2 bg-gradient-to-b from-[#060605] to-50%'>
            <p>
              <b>
              The most honest tap-clicker<br />
              Click and get coins. Level up!
              </b>
            </p>
            <br />
            <p>
              Fix your levels by sending eaten coins to a special fixation account,
              where they will always be as long as the blockchain exists.
            </p>
            <br />
            <p>
              Eaten and fixed coins are withdrawn from circulation,
              and the price of the <span className='text-[#b1ccff]'>$EDogs</span> coin increases
            </p>
            <p className='flex items-center justify-center my-4'>
              <img className='mr-3' src='/public/confetti.svg' alt='' />
              <b>
                It's very simple!!!
              </b>
            </p>
            <p className='my-4'>
              <a target='_blank' href='https://raydium.io/swap/?inputMint=sol&outputMint=mnt6Lp5aBWL6FD5QJx3CADTsqrs2vRjHGze6XtidDka' className='inline-block'>
                Buy <span className='underline text-[#b1ccff]'>$EDogs</span> on Radium DEX
              </a>
            </p>
            <p className='my-4'>
              <a target='_blank' href='http://edogs.vip' className='inline-block'>
              Visit site <span className='underline text-[#b1ccff]'>http://edogs.vip</span>
              </a>
            </p>
            <div className='text-xs mt-6 text-gray-400'>
              * $EDogs is a meme token based on the Solana blockchain with no intrinsic value or expectation of financial return
            </div>
          </div>
        </div>
      </div>
      <div className={(txid ? "active " : "") + " block-display flex items-center justify-center z-30"}>
        <div className="block-display-content flex flex-col items-center rounded-lg text-center m-4 px-4 py-8">
          <img className='max-w-44 mb-5' src='/public/level-up.webp' alt='' />
          <p className='text-2xl mb-5'>
            Level up to {level}!!!
          </p>
          <div>
            <p className='mb-2'>
              Txid:<br/>
            </p>
            <Clipboard txid={txid} />
          </div>
          <a className='inline-flex align-middle justify-center mt-4' target='_blank' href={'https://solscan.io/tx/' + txid}>
            See in Solscan 
            <img className='w-10 ml-2 h-8 w-8 -mt-1' src='/public/solscan.png' alt=''/>
          </a>
          <button className='wallet-adapter-button wallet-adapter-button-trigger mx-auto mt-6' onClick={handleClickOkLevelWin}>OK</button>
        </div>
      </div>
      <div className={(error ? "active " : "") + " block-display flex items-center justify-center z-30"}>
        <div className="block-display-content flex flex-col items-center rounded-lg text-center m-4 px-4 py-10">
          <img className='max-w-16 mb-5' src='/public/error.png' alt='' />
          {error ? (
            <>
              <p className='text-2xl mb-5'>{error.title}</p>
              <p className='mb-2'>{error.text}</p>
            </>
          ) : (
            <p className='text-2xl mb-5'>{String(error)}</p>
          )}
          <button className='wallet-adapter-button wallet-adapter-button-trigger mx-auto mt-6' onClick={handleClickOkError}>Close</button>
        </div>
      </div>
      <div className={(isLoading ? "active " : "") + " block-display flex items-center justify-center z-30"}>
        <div className="block-display-content flex flex-col items-center rounded-lg text-center m-4 px-4 py-10">
          {/*<img className='max-w-16 mb-5' src='/public/error.png' alt='' />*/}
          <svg className="icon-loading w-20 mb-6" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512.32 282.944c-31.872 0-57.664-25.792-57.664-57.664L454.656 57.984c0-31.808 25.792-57.6 57.664-57.6s57.664 25.792 57.664 57.6l0 167.424C569.984 257.216 544.192 282.944 512.32 282.944zM512.32 1023.616c-20.608 0-37.312-16.704-37.312-37.248l0-209.536c0-20.544 16.704-37.248 37.312-37.248 20.544 0 37.312 16.704 37.312 37.248l0 209.536C549.632 1006.912 532.864 1023.616 512.32 1023.616zM370.368 323.264c-19.328 0-38.08-10.048-48.448-28.032L234.176 145.792C218.752 119.04 227.968 84.8 254.656 69.312c26.752-15.36 60.992-6.272 76.416 20.48L418.752 239.36c15.36 26.752 6.272 60.928-20.48 76.352C389.44 320.832 379.904 323.264 370.368 323.264zM750.016 959.936c-11.776 0-22.848-6.016-29.12-16.768l-106.176-186.176c-9.344-16-3.968-36.544 12.16-45.888 16-9.344 36.48-3.84 45.888 12.16l106.112 186.112c9.344 16 3.904 36.608-12.096 45.952C761.344 958.528 755.648 959.936 750.016 959.936zM269.632 424.896c-8.96 0-17.856-2.176-26.048-6.912l-155.072-89.6C63.488 313.856 54.912 281.984 69.376 257.088c14.4-25.088 46.336-33.6 71.296-19.2l155.072 89.536C320.832 341.76 329.344 373.696 315.008 398.72 305.28 415.552 287.744 424.896 269.632 424.896L269.632 424.896zM928.768 783.168c-4.864 0-9.984-1.344-14.72-3.968l-193.344-112.128c-14.4-8.256-19.136-26.496-10.88-40.768 8.128-14.272 26.496-19.136 40.768-11.008l193.28 112.064c14.4 8.448 19.136 26.496 11.008 40.96C949.248 777.792 939.008 783.168 928.768 783.168L928.768 783.168zM235.264 561.92 48.768 561.92c-26.752 0-48.512-21.76-48.512-48.576s21.696-48.512 48.512-48.512l186.496 0c26.88 0 48.512 21.696 48.512 48.512S262.08 561.92 235.264 561.92zM993.856 542.528 993.856 542.528l-223.744 0c-16.512 0-29.888-13.376-29.888-29.824 0-16.448 13.376-29.824 29.888-29.824l0 0 223.744 0c16.512 0 29.888 13.376 29.888 29.824C1023.744 529.152 1010.368 542.528 993.856 542.528zM108.416 789.44c-15.488 0-30.656-8-38.784-22.464-12.224-21.504-5.056-48.896 16.384-61.12l169.088-96C276.544 597.632 303.808 604.864 316.16 626.304c12.288 21.504 4.992 48.832-16.448 61.056l-169.024 96C123.712 787.456 116.032 789.44 108.416 789.44zM736.576 414.272c-10.24 0-20.288-5.376-25.792-14.912-8.256-14.272-3.328-32.512 11.008-40.768l193.216-112.064c14.336-8.256 32.512-3.392 40.832 10.88 8.256 14.336 3.392 32.512-10.944 40.832L751.36 410.368C746.816 412.992 741.568 414.336 736.576 414.272L736.576 414.272zM278.144 960c-6.912 0-14.016-1.856-20.48-5.504-19.648-11.456-26.304-36.48-14.912-56.128l99.776-173.504c11.456-19.84 36.416-26.304 56.128-15.04 19.712 11.456 26.304 36.48 14.976 56.128l-99.84 173.44C306.176 952.64 292.352 960 278.144 960zM641.728 318.4c-4.928 0-10.048-1.28-14.784-3.968C612.608 306.176 607.808 287.872 615.936 273.536l110.976-192c8.384-14.272 26.496-19.136 40.96-10.944 14.272 8.192 19.136 26.496 10.88 40.768l-110.976 192C662.144 313.024 652.032 318.336 641.728 318.4L641.728 318.4z"  /></svg>
          <p className='text-center text-xl'>
            Waiting...
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
