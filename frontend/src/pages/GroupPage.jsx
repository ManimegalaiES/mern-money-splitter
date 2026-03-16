import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import Header from "../components/Header";
import { CartesianGrid, Legend } from "recharts";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

export default function GroupPage() {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [group, setGroup] = useState(null);

  const [successAmount, setSuccessAmount] = useState("");
const [successName, setSuccessName] = useState("");

  const round = (num) => Number(num.toFixed(2));

  const [showSuccess, setShowSuccess] = useState(false);

  const [showMembers, setShowMembers] = useState(false);

  const [balances, setBalances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [history, setHistory] = useState([]);

  const [showMarkPaid, setShowMarkPaid] = useState(false);

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitWith, setSplitWith] = useState([]);

  const [splitType, setSplitType] = useState("equal");
  const [customValues, setCustomValues] = useState({});

const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");

const [paymentMode, setPaymentMode] = useState(null);

  const [editingExpense, setEditingExpense] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const [editSplitType, setEditSplitType] = useState("equal");
  const [editCustomValues, setEditCustomValues] = useState({});

const [activeSection, setActiveSection] = useState("expenses");

  const [category, setCategory] = useState("Food");
const [customCategory, setCustomCategory] = useState("");

const [searchText, setSearchText] = useState("");
const [filterCategory, setFilterCategory] = useState("all");
const [filterMember, setFilterMember] = useState("all");

const fireConfetti = () => {

confetti({
particleCount:80,
angle:60,
spread:70,
origin:{x:0}
});

confetti({
particleCount:80,
angle:120,
spread:70,
origin:{x:1}
});

};

const payWithUPI = () => {

if(!settleTo || !settleAmount){
alert("Select user and amount");
return;
}

const receiver = group.members.find(
m => m._id === settleTo
);

if(!receiver?.upiId){
alert("Receiver has not set UPI ID");
return;
}

const upiLink =
`upi://pay?pa=${receiver.upiId}&pn=${receiver.name}&am=${settleAmount}&cu=INR`;


window.location.href = upiLink;

};

const [showAnalytics, setShowAnalytics] = useState(false);

  const load = async () => {
    const [g, b, e, s, h] = await Promise.all([
  API.get(`/api/groups/${id}`),
  API.get(`/api/balance/${id}`),
  API.get(`/api/expenses/${id}`),
  API.get(`/api/summary/${id}`),
  API.get(`/api/settle/${id}`)
]);
    setGroup(g.data);
    setBalances(b.data);
    setExpenses(e.data);
    setSummary(s.data);
    setHistory(h.data);

    setPaidBy(currentUser._id);
    setSplitWith(g.data.members.map(m => m._id));
  };

  useEffect(() => {
    load();
  }, [id]);

useEffect(() => {

if(paymentMode === "online"){

setShowMarkPaid(false);

const timer = setTimeout(() => {
setShowMarkPaid(true);
},5000);

return () => clearTimeout(timer);

}

},[paymentMode]);

  /* ================= ADD EXPENSE ================= */
  const addExpense = async () => {
    if (!desc || !amount || !paidBy || splitWith.length === 0) {
      alert("Please fill all fields");
      return;
    }

    let split = [];

    if (splitType === "equal") {
      const share = round(Number(amount) / splitWith.length);
      split = splitWith.map(uid => ({
        userId: uid,
        share
      }));
    }

    if (splitType === "exact") {
      const total = splitWith.reduce(
          (sum, uid) => sum + Number(customValues[uid] || 0),
          0
        );

      if (Math.abs(total - Number(amount)) > 0.01) {
        alert("Custom split must equal total amount");
        return;
      }

      split = splitWith.map(uid => ({
        userId: uid,
        share: round(Number(customValues[uid] || 0))
      }));
    }

    if (splitType === "percent") {
      const totalPercent = splitWith.reduce(
  (sum, uid) => sum + Number(customValues[uid] || 0),
  0
);

      if (Math.abs(totalPercent - 100) > 0.01) {
        alert("Total percentage must be 100%");
        return;
      }

      split = splitWith.map(uid => ({
        userId: uid,
        share: round(
          (Number(customValues[uid]) / 100) *
          Number(amount)
        )
      }));
    }

    if (splitType === "shares") {
      const totalShares = Object.values(customValues)
        .reduce((sum, v) => sum + Number(v), 0);

      if (totalShares <= 0) {
        alert("Invalid shares");
        return;
      }

      const valuePerShare = round(Number(amount) / totalShares);

      split = splitWith.map(uid => ({
        userId: uid,
        share: round(
          valuePerShare * Number(customValues[uid] || 0)
        )
      }));
    }

    await API.post("/api/expenses", {
      groupId: id,
      description: desc,
      amount: Number(amount),
      paidBy,
      splitBetween: split,
      category,
      customCategory
    });

    setDesc("");
    setAmount("");
    setCustomValues({});
    setSplitType("equal");
    setCategory("Food");
    setCustomCategory("");
    load();
  };

  /* ================= DELETE EXPENSE ================= */
  const deleteExpense = async (expenseId) => {
    if (!window.confirm("Delete expense?")) return;
    await API.delete(`/api/expenses/${expenseId}`);
    load();
  };

  /* ================= OPEN EDIT ================= */
  // const openEdit = (exp) => {
  //   setEditingExpense(exp);
  //   setEditDesc(exp.description);
  //   setEditAmount(exp.amount);
  // };

  const openEdit = (exp) => {
  setEditingExpense(exp);
  setEditDesc(exp.description);
  setEditAmount(exp.amount);

  setEditSplitType("equal");
  setEditCustomValues({});

  // Pre-fill values if existing split available
  const values = {};
  exp.splitBetween.forEach(s => {
    values[s.userId] = s.share;
  });

  setEditCustomValues(values);
};

  const updateExpense = async () => {
  let split = [];

  /* ===== EQUAL ===== */
  if (editSplitType === "equal") {
    const share = round(
      Number(editAmount) /
      editingExpense.splitBetween.length
    );

    split =
      editingExpense.splitBetween.map(s => ({
        userId: s.userId,
        share
      }));
  }

  /* ===== EXACT ===== */
  if (editSplitType === "exact") {
    const total = Object.values(editCustomValues)
      .reduce((sum, v) => sum + Number(v), 0);

    if (Math.abs(total - Number(editAmount)) > 0.01) {
      alert("Custom split must equal total amount");
      return;
    }

    split =
      editingExpense.splitBetween.map(s => ({
        userId: s.userId,
        share: round(Number(editCustomValues[s.userId] || 0))
      }));
  }

  /* ===== PERCENT ===== */
  if (editSplitType === "percent") {
    const totalPercent = Object.values(editCustomValues)
      .reduce((sum, v) => sum + Number(v), 0);

    if (Math.abs(totalPercent - 100) > 0.01) {
      alert("Total percentage must be 100%");
      return;
    }

    split =
      editingExpense.splitBetween.map(s => ({
        userId: s.userId,
        share: round(
          (Number(editCustomValues[s.userId]) / 100) *
          Number(editAmount)
        )
      }));
  }

  /* ===== SHARES ===== */
  if (editSplitType === "shares") {
  const totalShares = Object.values(editCustomValues)
    .reduce((sum, v) => sum + Number(v), 0);

  if (totalShares <= 0) {
    alert("Invalid shares");
    return;
  }

  const valuePerShare =
    round(Number(editAmount) / totalShares);

  split =
    editingExpense.splitBetween.map(s => ({
      userId: s.userId,
      share: round(
        valuePerShare *
        Number(editCustomValues[s.userId])
      )
    }));
}

  await API.put(
    `/api/expenses/${editingExpense._id}`,
    {
      description: editDesc,
      amount: Number(editAmount),
      splitBetween: split
    }
  );

  setEditingExpense(null);
  load();
};

  /* ================= SETTLE ================= */
  const settle = async () => {
    const my = balances.find(
      b => b.id === currentUser._id
    );

    if (!my || my.balance >= 0) {
      alert("You do not owe anyone");
      return;
    }

    if (!settleTo || !settleAmount) {
      alert("Select who to pay and amount");
      return;
    }

    const max = round(Math.abs(my.balance));

    if (Number(settleAmount) > max) {
      alert(`You can only pay up to ₹${max}`);
      return;
    }

    await API.post("/api/settle", {
      fromUser: currentUser._id,
      toUser: settleTo,
      amount: Number(settleAmount),
      groupId: id
    });

 const receiver = group.members.find(m => m._id === settleTo);

setSuccessAmount(settleAmount);
setSuccessName(receiver?.name || "");

fireConfetti();

setShowSuccess(true);

setTimeout(()=>{
setShowSuccess(false);
},2500);

setSettleAmount("");
setSettleTo("");
    setShowPaymentOptions(false);
    setPaymentMode(null);
    setShowMarkPaid(false);
    load();
  };

  if (!group) return null;

  /* ================= ANALYTICS CALCULATIONS ================= */

  const COLORS = [
            "#6366F1",
            "#22C55E",
            "#F59E0B",
            "#EF4444",
            "#3B82F6",
            "#A855F7"
          ];

// Total Spending
const totalSpending = expenses.reduce(
  (sum, e) => sum + Number(e.amount),
  0
);

// Most Paying Member
const payerMap = {};

expenses.forEach(e => {
  const name = e.paidBy?.name;
  payerMap[name] = (payerMap[name] || 0) + Number(e.amount);
});

const mostPayer = Object.entries(payerMap)
  .sort((a, b) => b[1] - a[1])[0];

// Category Data
const categoryMap = {};

expenses.forEach(e => {
  const cat = e.category;

  categoryMap[cat] =
    (categoryMap[cat] || 0) + Number(e.amount);
});

const categoryData = Object.keys(categoryMap).map(k => ({
  name: k,
  value: categoryMap[k]
}));

// Monthly Data
// const monthlyMap = {};

// expenses.forEach(e => {
//   if (!e.createdAt) return;

//   const d = new Date(e.createdAt);

//   const key = `${d.getFullYear()}-${d.getMonth()}`; // sortable key

//   if (!monthlyMap[key]) {
//     monthlyMap[key] = {
//       month: d.toLocaleString("default", { month: "short" }) + " " + d.getFullYear(),
//       amount: 0
//     };
//   }

//   monthlyMap[key].amount += Number(e.amount);
// });

// const monthlyData = Object.values(monthlyMap);

// Daily Data
// const dailyMap = {};

// expenses.forEach(e => {
//   if (!e.createdAt) return;

//   const d = new Date(e.createdAt);

//   const key = d.toISOString().split("T")[0]; // YYYY-MM-DD

//   if (!dailyMap[key]) {
//     dailyMap[key] = {
//       day: d.getDate() + " " +
//            d.toLocaleString("default", { month: "short" }),
//       amount: 0
//     };
//   }

//   dailyMap[key].amount += Number(e.amount);
// });

// const dailyData = Object.values(dailyMap);

  // Top Spenders Data
const spenderMap = {};

expenses.forEach(e => {
  const name = e.paidBy?.name;
  if (!name) return;

  spenderMap[name] =
    (spenderMap[name] || 0) + Number(e.amount);
});

const topSpenders = Object.keys(spenderMap)
  .map(name => ({
    name,
    amount: spenderMap[name]
  }))
  .sort((a,b)=> b.amount - a.amount)
  .slice(0,5);

  const filteredExpenses = expenses.filter(exp => {
  const matchText =
    exp.description?.toLowerCase().includes(searchText.toLowerCase());

  const categoryName =
    exp.category === "Others" ? exp.customCategory : exp.category;

  const matchCategory =
    filterCategory === "all" || categoryName === filterCategory;

  const matchMember =
    filterMember === "all" || exp.paidBy?._id === filterMember;

  return matchText && matchCategory && matchMember;
});

if (showAnalytics) {
  return (
    <div className="min-h-screen bg-[#1E1B2E] text-white">
      <Header />

      <div className="max-w-6xl mx-auto mt-10 
                      bg-white/5 backdrop-blur-lg 
                      border border-white/10 
                      p-8 rounded-2xl">

        <div className="flex justify-between mb-8">
          <h2 className="text-3xl font-bold">
            {group.name} Analytics
          </h2>

          <button
            onClick={() => setShowAnalytics(false)}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Back
          </button>
        </div>

        {/* TOTAL SPENDING */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-2">
            Total Group Spending
          </h3>

          <p className="text-3xl text-green-400">
            ₹{totalSpending.toFixed(2)}
          </p>
        </div>

        {/* MOST PAYING MEMBER */}
        {mostPayer && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-2">
              Most Paying Member
            </h3>

            <p className="text-lg">
              {mostPayer[0]} paid ₹{mostPayer[1].toFixed(2)}
            </p>
          </div>
        )}

        {/* TOP SPENDERS */}
<div className="mt-12">
  <h3 className="text-xl font-semibold mb-4">
    Top Members Spending
  </h3>

  <div className="bg-[#2A2640] p-6 rounded-xl">
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={topSpenders}
        layout="vertical"
      >

        <CartesianGrid strokeDasharray="3 3" stroke="#444" />

        <XAxis
          type="number"
          stroke="#ccc"
        />

        <YAxis
          dataKey="name"
          type="category"
          stroke="#ccc"
        />

        <Tooltip />

        <Legend />

        <Bar
          dataKey="amount"
          name="Total Paid"
          fill="#F59E0B"
          radius={[0,8,8,0]}
        />

      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

        {/* CATEGORY PIE CHART */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* CATEGORY */}
          <div>
          <h3 className="text-xl font-semibold mb-4">
            Category Spending
          </h3>

          <div className="bg-[#2A2640] p-6 rounded-xl">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={5}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* MONTHLY BAR CHART */}
        {/*<div>
          <h3 className="text-xl font-semibold mb-4">
            Monthly Spending
          </h3>

          <div className="bg-[#2A2640] p-6 rounded-xl">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />

                  <XAxis
                    dataKey="month"
                    stroke="#ccc"
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />

                  <YAxis
                    stroke="#ccc"
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="amount"
                    name="Amount Spent"
                    fill="#6366F1"
                    radius={[8,8,0,0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>*/}
</div>
      </div>
      {/* DAILY SPENDING */}
      {/*
<div className="mt-12">
  <h3 className="text-xl font-semibold mb-4">
    Daily Spending
  </h3>

  <div className="bg-[#2A2640] p-6 rounded-xl">
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={dailyData}>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />

        <XAxis
          dataKey="day"
          stroke="#ccc"
          tick={{ fontSize: 12 }}
          interval={0}
        />

        <YAxis
          stroke="#ccc"
          tick={{ fontSize: 12 }}
        />

        <Tooltip />

        <Legend />

        <Bar
          dataKey="amount"
          name="Daily Spending"
          fill="#22C55E"
          radius={[8,8,0,0]}
        />

      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
      */}
    </div>
  );
}

const receiver = group?.members?.find(
  m => m._id === settleTo
);

  return (
    <div className="min-h-screen bg-[#1E1B2E] text-white">
      <Header />

      <div className="max-w-5xl mx-auto mt-10 
                bg-white/5 backdrop-blur-lg 
                border border-white/10 
                p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            {group.name}
          </h2>

          <div className="flex gap-3">

            <button
              onClick={() => setShowAnalytics(true)}
              className="bg-gradient-to-r 
                        from-indigo-500 to-purple-500
                        px-4 py-2 rounded-xl font-medium
                        hover:scale-105 transition"
            >
              Analytics Dashboard
            </button>

            <button
              onClick={() => setShowMembers(!showMembers)}
              className="bg-gradient-to-r 
                        from-purple-500 to-indigo-500
                        px-4 py-2 rounded-xl font-medium
                        hover:scale-105 transition"
            >
              {showMembers ? "Hide Members" : "View Members"}
            </button>

          </div>
        </div>

        {showMembers && (
          <div className="mb-6 bg-[#2A2640] border border-white/10 p-6 rounded-2xl">
            <h3 className="font-semibold mb-2">Group Members</h3>

            {group.members.map(member => (
              <div key={member._id} className="py-1 text-gray-300">
                👤 {member.name}
              </div>
            ))}
          </div>
        )}

        {/* ================= ADD EXPENSE ================= */}
        <div className="mb-10 
           bg-[#2A2640] 
           border border-white/10 
           p-6 rounded-2xl">
          <h3 className="font-bold mb-3">
            Add Expense
          </h3>

          <input
            placeholder="Description"
            className="w-full bg-[#1F1C35] 
           border border-white/10 
           p-3 rounded-lg 
           focus:ring-2 focus:ring-purple-500 
           outline-none mb-3"
            value={desc}
            onChange={e =>
              setDesc(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Amount"
            className="w-full bg-[#1F1C35] 
           border border-white/10 
           p-3 rounded-lg 
           focus:ring-2 focus:ring-purple-500 
           outline-none mb-3"
            value={amount}
            onChange={e =>
              setAmount(e.target.value)
            }
          />

          <select
            className="w-full bg-[#1F1C35] 
                      border border-white/10 
                      p-3 rounded-lg 
                      mb-3"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="Food">🍕 Food</option>
            <option value="Travel">✈️ Travel</option>
            <option value="Rent">🏠 Rent</option>
            <option value="Entertainment">🎬 Entertainment</option>
            <option value="Shopping">🛒 Shopping</option>
            <option value="Others">Others</option>
          </select>

          {category === "Others" && (
            <input
              type="text"
              placeholder="Enter custom category"
              className="w-full bg-[#1F1C35] 
                        border border-white/10 
                        p-3 rounded-lg 
                        mb-3"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
            />
          )}

          <select
            className="w-full bg-[#1F1C35] 
           border border-white/10 
           p-3 rounded-lg 
           focus:ring-2 focus:ring-purple-500 
           outline-none mb-3"
            value={paidBy}
            onChange={e =>
              setPaidBy(e.target.value)
            }
          >
            {group.members.map(m => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>

          <p className="font-medium mt-3 mb-1">
            Split With
          </p>

          {group.members.map(m => (
            <label key={m._id} className="block">
              <input
                type="checkbox"
                checked={splitWith.includes(m._id)}
                onChange={e => {
                  if (e.target.checked)
                    setSplitWith([
                      ...splitWith,
                      m._id
                    ]);
                  else
                    setSplitWith(
                      splitWith.filter(
                        x => x !== m._id
                      )
                    );
                }}
              />{" "}
              {m.name}
            </label>
          ))}

          <div className="flex gap-2 mt-4">
            {["equal", "exact", "percent", "shares"].map(type => (
              <button
                key={type}
                onClick={() => {
                  setSplitType(type);
                  setCustomValues({});
                }}
                className={`px-3 py-1 rounded ${
                  splitType === type
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                    : "bg-[#3A3658] text-gray-300"
                }`}
              >
                {type === "equal"
                  ? "Equal"
                  : type === "exact"
                  ? "Custom"
                  : type === "percent"
                  ? "% Split"
                  : "Shares"}
              </button>
            ))}
          </div>

          {splitType !== "equal" && (
            <div className="mt-4 space-y-2">
              {splitWith.map(uid => {
                const member = group.members.find(
                  m => m._id === uid
                );

                return (
                  <div
                    key={uid}
                    className="flex justify-between items-center"
                  >
                    <span>{member?.name}</span>

                    <input
                      type="number"
                      placeholder={
                        splitType === "exact"
                          ? "Amount"
                          : splitType === "percent"
                          ? "%"
                          : "Shares"
                      }
                      className="w-28 bg-[#1F1C35] border border-white/10 p-2 rounded-lg text-white"
                      value={
                        customValues[uid] !== undefined
                          ? customValues[uid]
                          : ""
                      }
                      onChange={e =>
                        setCustomValues(prev => ({
                          ...prev,
                          [uid]: e.target.value
                        }))
                      }
                    />
                  </div>
                );
              })}

              {splitType === "percent" && (
                <p className="text-sm text-gray-500">
                  Total must equal 100%
                </p>
              )}

              {splitType === "shares" && (
                <p className="text-sm text-gray-500">
                  Amount divided based on shares
                </p>
              )}
            </div>
          )}

          <button
            onClick={addExpense}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
          >
            Add Expense
          </button>
        </div>

        {/* ================= SECTION NAVIGATION ================= */}

{/* <div className="flex gap-3 mb-8">

<button
onClick={() => setActiveSection("expenses")}
className={`px-4 py-2 rounded-xl font-medium transition
${activeSection === "expenses"
? "bg-purple-600"
: "bg-[#2A2640]"}`}
>
Expenses
</button>

<button
onClick={() => setActiveSection("balances")}
className={`px-4 py-2 rounded-xl font-medium transition
${activeSection === "balances"
? "bg-purple-600"
: "bg-[#2A2640]"}`}
>
Balances
</button>

<div className="flex gap-3 mt-3">

<button
onClick={() => setActiveSection("settle")}
className={`px-4 py-2 rounded-xl font-medium transition
${activeSection === "settle"
? "bg-purple-600"
: "bg-[#2A2640]"}`}
>
Settle Up
</button>

</div>

</div> */}

<div className="flex items-center gap-3 mb-8">

<button
onClick={() => setActiveSection("expenses")}
className={`px-4 py-2 rounded-xl font-medium transition
${activeSection === "expenses"
? "bg-purple-600"
: "bg-[#2A2640]"}`}
>
Expenses
</button>

<button
onClick={() => setActiveSection("balances")}
className={`px-4 py-2 rounded-xl font-medium transition
${activeSection === "balances"
? "bg-purple-600"
: "bg-[#2A2640]"}`}
>
Balances
</button>

<button
onClick={() => setActiveSection("settle")}
className={`px-4 py-2 rounded-xl font-medium transition
${activeSection === "settle"
? "bg-purple-600"
: "bg-[#2A2640]"}`}
>
Settle Up
</button>

</div>

        {/* ================= SEARCH + FILTERS ================= */}

{activeSection === "expenses" && (
<>

<div className="mb-6 bg-[#2A2640] border border-white/10 p-5 rounded-xl">

<h3 className="font-bold mb-3">Search & Filters</h3>

<div className="grid md:grid-cols-3 gap-3">

{/* SEARCH */}
<input
  placeholder="Search description..."
  className="bg-[#1F1C35] border border-white/10 p-3 rounded-lg"
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
/>

{/* CATEGORY FILTER */}
<select
  className="bg-[#1F1C35] border border-white/10 p-3 rounded-lg"
  value={filterCategory}
  onChange={(e) => setFilterCategory(e.target.value)}
>
  <option value="all">All Categories</option>
  <option value="Food">Food</option>
  <option value="Travel">Travel</option>
  <option value="Rent">Rent</option>
  <option value="Entertainment">Entertainment</option>
  <option value="Shopping">Shopping</option>
</select>

{/* MEMBER FILTER */}
<select
  className="bg-[#1F1C35] border border-white/10 p-3 rounded-lg"
  value={filterMember}
  onChange={(e) => setFilterMember(e.target.value)}
>
  <option value="all">All Members</option>

  {group.members.map(m => (
    <option key={m._id} value={m._id}>
      {m.name}
    </option>
  ))}
</select>

</div>
</div>

        {/* ================= EXPENSES ================= */}
        <div className="mb-8">
          <h3 className="font-bold mb-3">Expenses</h3>

          {expenses.length === 0 && (
            <p className="text-gray-400 italic">
  No expenses yet. Add your first one 🚀
</p>
          )}

          {filteredExpenses.map(exp => {
            const isOwner =
              exp.paidBy?._id === currentUser._id;

            return (
              <div
                key={exp._id}
                className="p-5 bg-[#2A2640] 
           border border-white/10 
           rounded-xl mb-4 
           hover:border-purple-500 transition"
              >
                <div className="font-semibold">
                  💰 {exp.description || "Expense"} 
({exp.category === "Others" ? exp.customCategory : exp.category}) —
                  {exp.paidBy?.name} paid ₹{Number(exp.amount).toFixed(2)}
                </div>

                <div className="text-sm text-gray-400 mt-1">
                  Split between:
                  {exp.splitBetween?.map(s => {
                    const member = group.members.find(m => m._id === s.userId);
                    return member?.name;
                  }).join(", ")}
                </div>

                {isOwner && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => openEdit(exp)}
                      className="px-3 py-1 bg-purple-500 text-white rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteExpense(exp._id)}
                      className="px-3 py-1 bg-red-500/80 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filteredExpenses.length === 0 && (
            <p className="text-gray-400 italic">
              No expenses match your filters
            </p>
          )}
        </div>
        </>
)}

        {/* ================= BALANCES ================= */}
        {activeSection === "balances" && (

<div className="mb-8">
<h3 className="font-bold mb-3">Balances</h3>

{balances.map(b => (
<div
key={b.id}
className="p-3 bg-[#2A2640] border border-white/10 rounded-lg mb-3 flex justify-between"
>
<span>{b.name}</span>

{b.balance > 0 ? (
<span className="text-green-400">
gets ₹{b.balance.toFixed(2)}
</span>
) : (
<span className="text-red-400">
owes ₹{Math.abs(b.balance).toFixed(2)}
</span>
)}

</div>
))}

</div>

)}

{activeSection === "settle" && (
<>
{/* ================= SETTLE ================= */}
        <div className="bg-[#2A2640] 
           border border-white/10 
           p-6 rounded-2xl mb-10">
          <h3 className="font-bold mb-3">Settle Up</h3>

          <select
            className="w-full bg-[#1F1C35] 
           border border-white/10 
           p-3 rounded-lg 
           focus:ring-2 focus:ring-purple-500 
           outline-none mb-3"
            value={settleTo}
            onChange={e => setSettleTo(e.target.value)}
          >
            <option value="">Pay To</option>

            {balances
              .filter(b => b.balance > 0)
              .filter(b => b.id !== currentUser._id)
              .map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} (₹{Number(b.balance).toFixed(2)})
                </option>
              ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            className="w-full bg-[#1F1C35] 
           border border-white/10 
           p-3 rounded-lg 
           focus:ring-2 focus:ring-purple-500 
           outline-none mb-3"
            value={settleAmount}
            onChange={e => setSettleAmount(e.target.value)}
            max={
              Math.abs(
                balances.find(b => b.id === currentUser._id)?.balance || 0
              )
            }
          />

          {/* SETTLE BUTTON */}
{!showPaymentOptions && (
<button
onClick={() => setShowPaymentOptions(true)}
className="w-full bg-gradient-to-r 
from-green-500 to-emerald-500 
py-3 rounded-xl font-semibold mt-3"
>
Settle Payment
</button>
)}

{/* PAYMENT OPTIONS */}

{showPaymentOptions && (
<div className="flex gap-3 mt-4">

<button
onClick={() => {
setPaymentMode("offline");
settle();
}}
className="flex-1 bg-green-600 py-3 rounded-xl"
>
Offline Payment
</button>

<button
onClick={() => setPaymentMode("online")}
className="flex-1 bg-purple-600 py-3 rounded-xl"
>
Online Payment
</button>

</div>
)}

          {paymentMode === "online" && (
<>
<button
onClick={payWithUPI}
className="w-full bg-purple-600 py-3 rounded-xl mt-3"
>
Pay with UPI
</button>
</>
)}

          {paymentMode === "online" && settleTo && settleAmount && (

            <div className="mt-6 flex justify-center">

              {receiver && settleAmount && (

<div className="bg-[#1F1C35] border border-white/10 p-4 rounded-xl mb-4 text-center">

<p className="text-gray-400 text-sm mb-1">
Paying
</p>

<p className="text-xl font-bold text-purple-400">
₹{settleAmount}
</p>

<p className="text-gray-300">
to {receiver.name}
</p>

</div>

)}

            <QRCodeSVG
              value={`upi://pay?pa=${
              group.members.find(m=>m._id===settleTo)?.upiId
              }&pn=${
              group.members.find(m=>m._id===settleTo)?.name
              }&am=${settleAmount}&cu=INR`}
              size={200}
            />

            </div>

            )}

            {paymentMode === "online" && !showMarkPaid && (
<p className="text-gray-400 mt-3 text-center">
Waiting for payment completion...
</p>
)}

          {showMarkPaid && (
<button
onClick={settle}
className="w-full bg-green-600 py-3 rounded-xl mt-4"
>
Mark Payment as Completed
</button>
)}
        </div>

        {/* ================= WHO OWES WHOM ================= */}
        <div className="mb-8">
          <h3 className="font-bold mb-3">Who Owes Whom</h3>
          {summary.map((s, i) => (
            <div
              key={i}
              className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded mb-2"
            >
              <b>{s.from}</b> should pay <b>{s.to}</b> ₹{Number(s.amount).toFixed(2)}
            </div>
          ))}
        </div>

        {/* ================= HISTORY ================= */}
        <div>
          <h3 className="font-bold mb-3">Settlement History</h3>
          {history.map(h => (
            <div key={h._id} className="p-3 bg-[#2A2640] 
           border border-white/10 
           rounded-lg mb-3">
              {h.fromUser.name} paid {h.toUser.name} ₹{Number(h.amount).toFixed(2)}
            </div>
          ))}
        </div>
</>
)}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingExpense && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm 
                  flex justify-center items-center z-50">

    <div className="bg-white/5 backdrop-blur-xl 
                    border border-white/10 
                    p-8 rounded-2xl w-[500px] 
                    text-white shadow-2xl">

      <h3 className="text-xl font-bold mb-5">
        Edit Expense
      </h3>

      <input
        className="w-full bg-[#1F1C35] 
                   border border-white/10 
                   p-3 rounded-lg mb-3"
        value={editDesc}
        onChange={e => setEditDesc(e.target.value)}
      />

      <input
        type="number"
        className="w-full bg-[#1F1C35] 
                   border border-white/10 
                   p-3 rounded-lg mb-4"
        value={editAmount}
        onChange={e => setEditAmount(e.target.value)}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {["equal", "exact", "percent", "shares"].map(type => (
          <button
            key={type}
            onClick={() => {
              setEditSplitType(type);
              setEditCustomValues({});
            }}
            className={`px-4 py-2 rounded-lg ${
              editSplitType === type
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                : "bg-[#3A3658] text-gray-300"
            }`}
          >
            {type}
          </button>
        ))}
        {editSplitType !== "equal" && (
  <div className="space-y-2 mb-4">
    {editingExpense.splitBetween.map(s => (
      <div
        key={s.userId}
        className="flex justify-between items-center"
      >
        <span>
{group.members.find(m => m._id === s.userId)?.name}
</span>

        <input
          type="number"
          className="w-28 bg-[#1F1C35] border border-white/10 p-2 rounded"
          value={editCustomValues[s.userId] || ""}
          onChange={(e) =>
            setEditCustomValues(prev => ({
              ...prev,
              [s.userId]: e.target.value
            }))
          }
        />
      </div>
    ))}
  </div>
)}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={updateExpense}
          className="flex-1 bg-gradient-to-r 
                     from-green-500 to-emerald-500 
                     py-3 rounded-xl font-semibold"
        >
          Save
        </button>

        <button
          onClick={() => setEditingExpense(null)}
          className="flex-1 border border-white/20 
                     py-3 rounded-xl"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}


{showSuccess && (

<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

<div className="bg-[#2A2640] p-10 rounded-2xl text-center shadow-xl animate-pop">

<div className="text-5xl mb-4">🎉</div>

<h2 className="text-2xl font-bold mb-2 text-green-400">
₹{successAmount} Paid to {successName}
</h2>

<p className="text-gray-300 text-lg">
✔ Settlement Completed
</p>

</div>

</div>

)}

    </div>
  );
}