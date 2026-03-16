import { useEffect, useState } from "react";
import API from "../api/axios";
import Header from "../components/Header";
import GroupCard from "../components/GroupCard";
import { useNavigate } from "react-router-dom";
import EditGroupModal from "../components/EditGroupModal";
import { Plus, CreditCard } from "lucide-react";
import UPISettings from "../components/UPISettings";

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [editGroup, setEditGroup] = useState(null);
  const navigate = useNavigate();
  const [showUPISettings, setShowUPISettings] = useState(false);

  const userId =
    JSON.parse(localStorage.getItem("user"))?._id;

  useEffect(() => {
    API.get("/api/groups").then(res => setGroups(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1B2E] text-white">

      <Header />

      <div className="p-10">

        {/* UPI Settings */}
        <div
className={`transition-all duration-500 ease-in-out
${showUPISettings ? "opacity-100 translate-y-0 max-h-96" : "opacity-0 -translate-y-4 max-h-0 overflow-hidden"}
`}
>
{showUPISettings && (
<UPISettings onSaved={() => setShowUPISettings(false)} />
)}
</div>
        {/* Top Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">My Groups</h2>
            <p className="text-gray-400 mt-1">
              Manage your shared expenses smartly
            </p>
          </div>

         <div className="flex gap-3">

<button
onClick={() => setShowUPISettings(true)}
className="flex items-center gap-2
bg-[#2A2640] border border-white/10
px-5 py-3 rounded-xl font-medium
hover:bg-[#3A3658] transition"
>
<CreditCard size={18} />
Set UPI ID
</button>

<button
onClick={() => navigate("/create-group")}
className="flex items-center gap-2 
bg-gradient-to-r from-purple-500 to-indigo-500 
px-6 py-3 rounded-xl font-semibold
hover:scale-105 transition duration-300 shadow-lg"
>
<Plus size={18} />
Create Group
</button>

</div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center 
                          bg-white/5 border border-white/10 
                          rounded-2xl p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">
              No Groups Yet 👀
            </h3>
            <p className="text-gray-400 mb-4">
              Create your first group to start splitting expenses.
            </p>
            <button
              onClick={() => navigate("/create-group")}
              className="bg-purple-600 px-5 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Create Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groups.map(g => (
              <div
                key={g._id}
                className="transform hover:scale-105 transition duration-300"
              >
                <GroupCard
                  group={g}
                  userId={userId}
                  refresh={() => window.location.reload()}
                  openEdit={setEditGroup}
                  onClick={() => navigate(`/group/${g._id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {editGroup && (
        <EditGroupModal
          group={editGroup}
          close={() => setEditGroup(null)}
          refresh={() => window.location.reload()}
        />
      )}
    </div>
  );
}