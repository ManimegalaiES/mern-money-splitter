import { useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import MoneyImage from "../assets/MoneyImage.jpg";

export default function Register() {
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [dark,setDark] = useState(true);
  const [agree,setAgree] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    if(!agree) return alert("Please accept Terms & Conditions");
    await API.post("/api/auth/register", { name,email,password });
    alert("Account created");
    navigate("/");
  };

  return (
    <div className={`${dark ? "bg-[#1E1B2E] text-white" : "bg-gray-100 text-black"} min-h-screen flex`}>

      {/* LEFT IMAGE PANEL */}
      <div 
        className="hidden md:flex w-1/2 relative items-end p-10 bg-cover bg-center"
        style={{
          backgroundImage: `url(${MoneyImage})`
        }}
      >
        <div className="bg-black/40 p-6 rounded-xl backdrop-blur-md">
          <h2 className="text-3xl font-semibold text-white">
            Split Smartly,<br/>Track Easily 💰
          </h2>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8 relative">

        <button 
          onClick={()=>setDark(!dark)}
          className="absolute top-6 right-6 p-2 rounded-full bg-purple-600 hover:scale-110 transition"
        >
          {dark ? <Sun size={18}/> : <Moon size={18}/>}
        </button>

        <form 
          onSubmit={submit}
          className={`${dark ? "bg-white/5 border-white/10" : "bg-white"} 
                     w-full max-w-md backdrop-blur-lg 
                     border rounded-2xl p-10 shadow-2xl`}
        >
          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="mb-8 text-gray-400">
            Already have an account?
            <Link to="/" className="text-purple-500 ml-1 hover:underline">
              Log in
            </Link>
          </p>

          <div className="space-y-5">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-[#2A2640] text-white border border-white/10 
                         p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={e=>setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full bg-[#2A2640] text-white border border-white/10 
                         p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              onChange={e=>setEmail(e.target.value)}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-[#2A2640] text-white border border-white/10 
                           p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                onChange={e=>setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={agree}
                onChange={()=>setAgree(!agree)}
                className="accent-purple-600"
              />
              <span>I agree to the Terms & Conditions</span>
            </div>

            <button 
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 
                         py-3 rounded-lg font-semibold 
                         hover:from-indigo-500 hover:to-purple-500 
                         transform hover:scale-105 transition duration-300 shadow-lg"
            >
              Create account
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}