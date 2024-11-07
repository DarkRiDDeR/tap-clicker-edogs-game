import { FC, useEffect, useRef, useState } from "react"
import * as clipboard from "clipboard-polyfill"

export const Clipboard: FC<{txid: string}> = ({txid}) => {
  const [isCopied, setIsCopied] = useState(false)
  const button = useRef(null)

  const handlerClickBtn = () => {
    clipboard.writeText(txid)
    console.log(txid)
    setIsCopied(true)
    
    setTimeout(() => {
      button.current.blur()
    }, 100)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  useEffect(() => {
  }, [isCopied]);

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center">
        <div className="relative w-full">
          <input
            type="text"
            aria-describedby="helper-text-explanation"
            className="bg-gray-50 border border-e-0 rounded-l-lg  border-gray-300 text-gray-500 dark:text-gray-400 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={txid}
            readOnly
            disabled
            />
        </div>
        <button
          ref={button}
          data-tooltip-target="tooltip-txid"
          data-copy-to-clipboard-target="txid"
          className="flex-shrink-0 z-10 inline-flex items-center py-3 px-4 text-sm font-medium text-center text-gray-500 dark:text-gray-400 hover:text-gray-900 bg-gray-100 border border-gray-300 rounded-e-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:hover:text-white dark:border-gray-600"
          type="button"
          onClick={handlerClickBtn}
          >
          <span className={(isCopied ? "hidden" : "")}>
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
              <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z"/>
            </svg>
          </span>
          <span className={(isCopied ? "" : "hidden") + " inline-flex items-center"}>
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
            </svg>
          </span>
        </button>
        {/*<div
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
          >
          <span className={(isCopied ? "hidden" : "")}>Copy link</span>
          <span className={(!isCopied ? "hidden" : "")}>Copied!</span>
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>*/}
      </div>
    </div>
  )
};