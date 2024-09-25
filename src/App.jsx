import { useEffect, useState } from "react";
import Chat from "./components/Chat"
import List from "./components/List"
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import Loader from "./components/Loader";
import Auth from "./components/Auth";
import Detail from './components/Detail'
import { useChatStore } from "./lib/chatStore";

function App() {
  const { currentUser, loading, fetchUserInfo } = useUserStore()
  const [showUserInfo, setShowUserInfo] = useState(false)
  const { user } = useChatStore()
  const [showFullImage, setShowFullImage] = useState(false)



  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    })

    return () => {
      unSub()
    }
  }, [fetchUserInfo])


  if (loading) return <div className="grid w-full h-screen text-white bg-slate-900 place-content-center"><Loader /></div>

  return (
    <div >
      <ToastContainer />
      <div className="grid w-full h-screen grid-cols-12 text-white bg-slate-900">
        {currentUser ?
          <>
            <List />
            <Chat
              showUserInfo={showUserInfo}
              setShowUserInfo={setShowUserInfo}
            />
            {user && showUserInfo &&
              <Detail
                showFullImage={showFullImage}
                setShowFullImage={setShowFullImage}
                showUserInfo={showUserInfo}
                setShowUserInfo={setShowUserInfo}
              />}
          </> :
          <Auth />
        }
      </div>
    </div>
  )
}

export default App
