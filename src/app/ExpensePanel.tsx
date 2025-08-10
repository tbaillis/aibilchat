import { useEffect, useState } from "react";

type Expense = {
  id: string;
  date: string;
  description: string;
  amount: string;
};

const STORAGE_KEY = "expenses_v1";

export default function ExpensePanel() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState<Omit<Expense, "id">>({
    date: "",
    description: "",
    amount: "",
  });
  const [email, setEmail] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  }

  function addExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!newExpense.date || !newExpense.description || !newExpense.amount) return;
    setExpenses([
      ...expenses,
      { ...newExpense, id: Date.now().toString() },
    ]);
    setNewExpense({ date: "", description: "", amount: "" });
  }

  function deleteExpense(id: string) {
    setExpenses(expenses.filter(exp => exp.id !== id));
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handleSaveAndEmail() {
    if (!email) return;
    const report = expenses.map(exp => `${exp.date}\t${exp.description}\t$${parseFloat(exp.amount).toFixed(2)}`).join("\n");
    const subject = encodeURIComponent("Expense Report");
    const body = encodeURIComponent(`Expense Report\n\nDate\tDescription\tAmount\n${report}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="p-4 w-full">
      <h2 className="text-lg font-bold mb-2">Expenses</h2>
      <form onSubmit={addExpense} className="flex gap-2 mb-4 flex-wrap">
        <input
          type="date"
          name="date"
          value={newExpense.date}
          onChange={handleChange}
          className="border rounded px-2 py-1"
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newExpense.description}
          onChange={handleChange}
          className="border rounded px-2 py-1"
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={newExpense.amount}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-24"
          min="0"
          step="0.01"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
          Add
        </button>
      </form>
      <div className="flex gap-2 items-center mb-4">
        <input
          type="email"
          placeholder="Enter email to send report"
          value={email}
          onChange={handleEmailChange}
          className="border rounded px-2 py-1"
        />
        <button
          type="button"
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={handleSaveAndEmail}
          disabled={!email || expenses.length === 0}
        >
          Save & Email
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(exp => (
              <tr key={exp.id}>
                <td className="border px-2 py-1">{exp.date}</td>
                <td className="border px-2 py-1">{exp.description}</td>
                <td className="border px-2 py-1 text-right">${parseFloat(exp.amount).toFixed(2)}</td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-2">No expenses yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
