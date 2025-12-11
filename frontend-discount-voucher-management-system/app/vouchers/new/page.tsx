"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateVoucherPage() {
  const router = useRouter();

  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/vouchers", {
        voucher_code: voucherCode,
        discount_percent: Number(discount),
        expiry_date: expiry,
      });

      alert("Voucher created!");
      router.push("/vouchers");

    } catch (err) {
      console.error(err);
      alert("Failed to create voucher");
    }

    setLoading(false);
  };

  return (
    <div className="container py-6">
      <h1 className="text-xl font-bold mb-4">Create New Voucher</h1>

      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded shadow">

        <div>
          <label className="block mb-1 font-medium">Voucher Code</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={voucherCode}
            onChange={e => setVoucherCode(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Discount (%)</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            value={discount}
            onChange={e => setDiscount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Expiry Date</label>
          <input
            type="date"
            className="border p-2 w-full rounded"
            value={expiry}
            onChange={e => setExpiry(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Create"}
        </button>
      </form>
    </div>
  );
}
