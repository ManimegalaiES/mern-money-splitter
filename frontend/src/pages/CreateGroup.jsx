import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Plus } from "lucide-react";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [emails, setEmails] = useState([""]);
  const navigate = useNavigate();

  const addEmail = () => setEmails([...emails, ""]);

  const changeEmail = (i, value) => {
    const copy = [...emails];
    copy[i] = value;
    setEmails(copy);
  };

  const submit = async e => {
    e.preventDefault();
    const clean = emails.filter(e => e.trim() !== "");

    await API.post("/api/groups", {
      name,
      members: clean
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#1E1B2E] text-white">
      <Header />

      <div className="flex justify-center items-center mt-16 px-6">

        <div className="w-full max-w-lg 
                        bg-white/5 backdrop-blur-lg 
                        border border-white/10 
                        p-8 rounded-2xl shadow-2xl">

          <h2 className="text-2xl font-bold mb-6">
            Create New Group
          </h2>

          <form onSubmit={submit} className="space-y-5">

            <input
              placeholder="Group name"
              className="w-full bg-[#2A2640] border border-white/10 
                         p-3 rounded-lg text-white
                         focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={e => setName(e.target.value)}
              required
            />

            <p className="text-gray-400 text-sm">
              Add Members (Email)
            </p>

            {emails.map((email, i) => (
              <input
                key={i}
                value={email}
                onChange={e => changeEmail(i, e.target.value)}
                placeholder="friend@gmail.com"
                className="w-full bg-[#2A2640] border border-white/10 
                           p-3 rounded-lg text-white
                           focus:ring-2 focus:ring-purple-500 outline-none"
              />
            ))}

            <button
              type="button"
              onClick={addEmail}
              className="flex items-center gap-2 text-purple-400 
                         hover:text-purple-600 transition text-sm"
            >
              <Plus size={16} />
              Add another
            </button>

            <button
              type="submit"
              className="w-full bg-gradient-to-r 
                         from-purple-500 to-indigo-500 
                         py-3 rounded-xl font-semibold
                         hover:from-indigo-500 hover:to-purple-500 
                         transform hover:scale-105 
                         transition duration-300 shadow-lg"
            >
              Create Group
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}