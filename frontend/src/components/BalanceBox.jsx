import { useEffect, useState } from "react";
import API from "../api/axios";

export default function BalanceBox({ groupId }) {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    API.get(`/api/balance/${groupId}`).then(res => {
      if (Array.isArray(res.data)) {
        setBalances(res.data);
      } else {
        setBalances([]);
      }
    });
  }, [groupId]);

  const settle = async (from, to, amount) => {
    await API.post("/api/settle", {
      fromUser: from,
      toUser: to,
      amount,
      groupId
    });
    window.location.reload();
  };

  const payer = balances.find(b => b.balance > 0);

  return (
    <div className="mt-4 border p-4">
      <h3 className="font-bold">Balances</h3>

      {balances.length === 0 && <p>No balances yet</p>}

      {balances.map(user => (
        <div key={user.id} className="flex justify-between mt-2">
          <span>
            {user.name} : ₹{user.balance}
          </span>

          {user.balance < 0 && payer && (
            <button
              className="bg-red-500 text-white px-2"
              onClick={() => settle(user.id, payer.id, Math.abs(user.balance))}
            >
              Settle Up
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
