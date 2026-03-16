import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import ExpenseForm from "../components/ExpenseForm";
import BalanceBox from "../components/BalanceBox";

export default function Group(){
  const { id } = useParams();

  const [expenses, setExpenses] = useState([]);
  const [group, setGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(()=>{
    // Fetch expenses
    API.get(`/api/expenses/${id}`)
      .then(res => setExpenses(res.data));

    // Fetch group details (for members)
    API.get(`/api/groups/${id}`)
      .then(res => setGroup(res.data));

  },[id]);

  return(
    <div className="p-5">

      {/* ===== HEADER SECTION ===== */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {group ? group.name : "Group"}
        </h2>

        <button
          onClick={() => setShowMembers(!showMembers)}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          {showMembers ? "Hide Members" : "View Members"}
        </button>
      </div>

      {/* ===== MEMBERS LIST ===== */}
      {showMembers && group && (
        <div className="border p-3 mb-5 rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Group Members</h3>
          {group.members.map(member => (
            <div key={member._id} className="py-1">
              👤 {member.name}
            </div>
          ))}
        </div>
      )}

      {/* ===== EXPENSE FORM ===== */}
      <ExpenseForm groupId={id}/>

      {/* ===== EXPENSES LIST ===== */}
      {expenses.map(e=>(
        <div key={e._id} className="border p-2 mt-2 rounded">
          <b>{e.description}</b> ₹{e.amount} (paid by {e.paidBy.name})
        </div>
      ))}

      {/* ===== BALANCE BOX ===== */}
      <BalanceBox groupId={id}/>
    </div>
  );
}