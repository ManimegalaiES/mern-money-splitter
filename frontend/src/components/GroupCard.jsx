import API from "../api/axios";
import { Pencil, Trash2, Users } from "lucide-react";

export default function GroupCard({
  group,
  userId,
  refresh,
  onClick,
  openEdit
}) {

  const isAdmin =
    group.createdBy?._id === userId;

  const deleteGroup = async e => {
    e.stopPropagation();
    if (!window.confirm("Delete group?")) return;
    await API.delete(`/api/groups/${group._id}`);
    refresh();
  };

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer 
                 bg-white/5 backdrop-blur-lg 
                 border border-white/10 
                 p-6 rounded-2xl shadow-lg
                 hover:border-purple-500 
                 hover:scale-105 transition duration-300"
    >
      <h3 className="font-bold text-xl text-white mb-2">
        {group.name}
      </h3>

      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Users size={16} />
        {group.members.length} members
      </div>

      {/* ADMIN BUTTONS */}
      {isAdmin && (
        <div className="absolute top-4 right-4 flex gap-3">

          <button
            onClick={(e)=>{
              e.stopPropagation();
              openEdit(group);
            }}
            className="text-purple-400 hover:text-purple-600 transition"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={deleteGroup}
            className="text-red-400 hover:text-red-600 transition"
          >
            <Trash2 size={16} />
          </button>

        </div>
      )}
    </div>
  );
}