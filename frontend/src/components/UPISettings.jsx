import { useState } from "react";
import API from "../api/axios";

export default function UPISettings({ onSaved }) {

const user = JSON.parse(localStorage.getItem("user"));

const [upi,setUpi] = useState(user?.upiId || "");

const saveUPI = async () => {

await API.put("/api/user/upi",{upiId:upi});

alert("UPI updated");

if(onSaved) onSaved(); // tell Dashboard to hide component

};

return(

<div className="bg-[#2A2640] p-6 rounded-xl mb-6">

<h3 className="font-bold mb-3">Your UPI ID</h3>

<input
className="w-full bg-[#1F1C35] border border-white/10 p-3 rounded-lg mb-3"
placeholder="example@upi"
value={upi}
onChange={(e)=>setUpi(e.target.value)}
/>

<button
onClick={saveUPI}
className="bg-purple-600 px-4 py-2 rounded"
>
Save UPI
</button>

</div>

);

}