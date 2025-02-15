import { storage } from "@/lib/storage";
import { useStorage } from "@plasmohq/storage/hook";
import { FaTwitch } from 'react-icons/fa';

import { sendToBackground } from "@plasmohq/messaging";
import withErrorBoundary from "./hooks/withErrorBoundary";
import "./style.css";

function IndexPopup() {
  const [user] = useStorage({
    key: "user",
    instance: storage
  })

  const login = () => {
    sendToBackground({
      name: "auth",
      body: {
        action: "login"
      }
    })
  }
  const logout = () => {
    sendToBackground({
      name: "auth",
      body: {
        action: "logout"
      }
    })
  }

  return (
    <div className="flex flex-col w-full h-full p-8 bg-twitch-background text-white">
    {user ? (
      <div className="flex flex-col items-center justify-center w-full h-full text-xl">
        Hello <span className="text-twitch">{user?.login}</span>
        <button className="hover:text-red-400" onClick={logout}>
          Logout ?
        </button>
      </div>
    ) : (
      <button
        className="bg-twitch px-4 py-2 hover:bg-twitch-dark focus:bg-twitch-dark rounded my-auto"
        onClick={login}>
        <FaTwitch className="inline-block mr-2" />
        Login with Twitch
      </button>
    )}
  </div>
  )
}

export default withErrorBoundary(IndexPopup, <div> Ooops, Error Occured </div>);
