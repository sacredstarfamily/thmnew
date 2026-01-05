"use client";

import { useRef } from "react";
import type { PayPalProduct } from "@/app/actions/paypalActions";

type Props = {
  open: boolean;
  product: PayPalProduct | null;
  onClose: () => void;
  onSave: (update: { id: string; name: string; price: number; quantity?: number }) => Promise<void> | void;
};

export function AdminPayPalUpdateModal({ open, product, onClose, onSave }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  if (!open || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value?.trim() ?? "";
    const price = Number(priceRef.current?.value ?? 0);
    const quantity = Number(quantityRef.current?.value ?? 0);
    await onSave({ id: product.id, name, price, quantity });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-lg border border-gray-300 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-black font-bold">Update product</h2>
          <button onClick={onClose} aria-label="Close" className="text-2xl hover:text-gray-700">✕</button>
        </div>
        <form key={product.id} className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-black text-sm font-medium">
            Name
            <input
              ref={nameRef}
              defaultValue={product.name ?? ""}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
              required
            />
          </label>
          <label className="block text-black text-sm font-medium">
            Price (USD)
            <input
              ref={priceRef}
              type="number"
              step="0.01"
              defaultValue={Number(product.price ?? 0)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
              required
            />
          </label>
          <label className="block text-black text-sm font-medium">
            Inventory Quantity
            <input
              ref={quantityRef}
              type="number"
              step="1"
              min="0"
              defaultValue={0}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
              Cancel
            </button>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
