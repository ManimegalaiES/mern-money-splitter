import { useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Header() {

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [notifications,setNotifications] = useState([]);
  const [open,setOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(()=>{
  fetchNotifications();

  const interval = setInterval(fetchNotifications, 10000);

  return () => clearInterval(interval);
},[]);

  const fetchNotifications = async () => {

    const res = await API.get("/api/notifications");

    setNotifications(res.data);

  };


  const markRead = async (id) => {

    await API.put(`/api/notifications/${id}/read`);

    fetchNotifications();

  };

  const unread = notifications.filter(n=>!n.isRead).length;

  return (

    <div className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 
                bg-[#1E1B2E]/80 backdrop-blur-lg 
                border-b border-white/10">

      <h1 className="text-2xl font-bold bg-gradient-to-r 
                     from-purple-400 to-indigo-500 
                     bg-clip-text text-transparent">
        💸 Money Splitter
      </h1>

      <div className="flex items-center gap-6">

        {/* Notification Bell */}
        <div className="relative">

          <button
            onClick={()=>setOpen(!open)}
            className="relative"
          >
            <Bell className="text-white"/>

            {unread>0 && (
              <span className="absolute -top-2 -right-2 
                               bg-red-500 text-white 
                               text-xs px-1 rounded-full">
                {unread}
              </span>
            )}

          </button>

          {open && (

           <div className="fixed right-8 top-16 w-80 
                bg-[#1F1B2E] rounded-xl 
                shadow-2xl p-4 z-[9999]
                max-h-96 overflow-y-auto">

              <h3 className="font-semibold mb-2 sticky top-0 bg-[#1F1B2E] py-1">
                Notifications
              </h3>

              {notifications.length===0 && (
                <p className="text-gray-400 text-sm">
                  No notifications
                </p>
              )}

              {notifications.map(n=>(
                <div
                  key={n._id}
                  onClick={()=>markRead(n._id)}
                 className={`p-3 text-sm border-b border-gray-700 cursor-pointer hover:bg-white/5 rounded`}
                >
                  {n.message}
                </div>
              ))}

            </div>

          )}

        </div>

        <span className="text-gray-300">
          Hello, <span className="text-white font-semibold">{user?.name}</span>
        </span>

        <button
          onClick={logout}
          className="flex items-center gap-2 
                     bg-red-500/20 text-red-400 
                     px-4 py-2 rounded-lg 
                     hover:bg-red-500 hover:text-white 
                     transition duration-300"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>

    </div>
  );
}