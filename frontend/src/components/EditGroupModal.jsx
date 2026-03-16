import { useState } from "react";
import API from "../api/axios";
import { X, UserPlus, Trash2 } from "lucide-react";

export default function EditGroupModal({
  group,
  close,
  refresh
}) {

  const [name, setName] = useState(group.name);
  const [email, setEmail] = useState("");
  const [showRemove, setShowRemove] =
    useState(false);

  const save = async () => {
    await API.put(`/api/groups/${group._id}`, { name });
    refresh();
    close();
  };

  const addMember = async () => {
    if (!email) return;

    try {
      await API.put(
        `/api/groups/${group._id}/add-member`,
        { email }
      );

      alert("Member added");
      refresh();
      setEmail("");

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const removeMember = async (id) => {
    try {
      await API.put(
        `/api/groups/${group._id}/remove-member`,
        { userId: id }
      );
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot remove member");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm 
                    flex justify-center items-center z-50">

      <div className="w-[550px] max-h-[90vh] overflow-y-auto
                      bg-white/5 backdrop-blur-xl 
                      border border-white/10 
                      rounded-2xl p-8 shadow-2xl 
                      text-white relative 
                      animate-fadeIn">

        {/* CLOSE BUTTON */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-400 
                     hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Edit Group
        </h2>

        {/* GROUP NAME */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm">
            Group Name
          </label>

          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full mt-2 bg-[#2A2640] 
                       border border-white/10 
                       p-3 rounded-lg 
                       focus:ring-2 focus:ring-purple-500 
                       outline-none"
          />
        </div>

        {/* ADD MEMBER */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <UserPlus size={18} />
            Add Member
          </h3>

          <div className="flex gap-3">
            <input
              placeholder="Enter email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-[#2A2640] 
                         border border-white/10 
                         p-3 rounded-lg 
                         focus:ring-2 focus:ring-purple-500 
                         outline-none"
            />

            <button
              onClick={addMember}
              className="bg-gradient-to-r 
                         from-green-500 to-emerald-500 
                         px-5 rounded-lg font-medium
                         hover:scale-105 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* REMOVE MEMBER */}
        <div className="mb-6">
          <button
            onClick={() => setShowRemove(!showRemove)}
            className="flex items-center gap-2 
                       bg-red-500/20 text-red-400 
                       px-4 py-2 rounded-lg 
                       hover:bg-red-500 hover:text-white 
                       transition"
          >
            <Trash2 size={16} />
            Remove Member
          </button>

          {showRemove && (
            <div className="mt-4 max-h-40 overflow-y-auto space-y-3">

              {group.members
                .filter(m => m._id !== group.createdBy._id)
                .map(m => (

                <div
                  key={m._id}
                  className="flex justify-between items-center 
                             bg-[#2A2640] p-3 rounded-lg"
                >
                  <span>{m.name}</span>

                  <button
                    onClick={() => removeMember(m._id)}
                    className="text-red-400 hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                </div>

              ))}

            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={close}
            className="px-5 py-2 border border-white/20 
                       rounded-lg hover:bg-white/10 transition"
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="px-6 py-2 rounded-lg font-semibold
                       bg-gradient-to-r 
                       from-purple-500 to-indigo-500
                       hover:scale-105 transition shadow-lg"
          >
            Save Changes
          </button>

        </div>
      </div>
    </div>
  );
}