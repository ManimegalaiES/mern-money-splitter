import { useState } from "react";
import API from "../api/axios";

export default function ExpenseForm({groupId}){
  const [amount,setAmount]=useState("");
  const [desc,setDesc]=useState("");

  const addExpense = async ()=>{
    await API.post("/api/expenses",{
      groupId,
      amount,
      description: desc,
      splitBetween:[]
    });
    window.location.reload();
  };

  return(
    <div className="mt-4">
      <input placeholder="Amount" className="border p-1" onChange={e=>setAmount(e.target.value)}/>
      <input placeholder="Description" className="border p-1 ml-2" onChange={e=>setDesc(e.target.value)}/>
      <button className="bg-green-500 text-white p-1 ml-2" onClick={addExpense}>Add</button>
    </div>
  );
}
