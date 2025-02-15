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
    <div className="flex flex-col w-[300px] h-full p-8 bg-twitch-background text-white">
    {user ? (
      <div className="flex flex-col justify-center text-xl gap-2">
        <h1 className="text-2xl font-bold">Twitch Follower Badge</h1>
        <hr />
        <p>Hello <span className="text-twitch">{user?.login}</span>, you're logged in.</p>
        <p className="text-sm text-gray-400">It might take a few seconds to load your <span className="line-through">bots</span>, I mean followers.</p>
        <button className="hover:text-red-400 text-sm" onClick={logout}>
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
