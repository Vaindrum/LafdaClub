"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAuthStore } from "@/stores/useAuthStore";
import { useModalStore } from "@/stores/useModalStore";
import { toast } from "react-toastify";

type OrderItem = {
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  quantity: number;
  size?: string;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

export default function OrderPage() {
  const { id } = useParams(); // expects URL like /order/[orderId]
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {authUser} = useAuthStore();
  const {openLogin} = useModalStore();

useEffect(() => {
    if (!authUser) {
      toast.info("Login to view your order")
      openLogin();
    }
  }, [authUser]);

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg bg-gray-900 text-white gap-2">
        <p>Please</p>
          <p className="text-pink-500 hover:text-pink-400 cursor-pointer" onClick={() => openLogin()}>log in</p>
            <p>to continue...</p>
      </div>
    );
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get(`order/${id}`);
        setOrder(data);
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(
          err.response?.data?.message || "Failed to load this order."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading order…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 p-6">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400 p-6">
        Order not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white px-4 md:px-8 py-10">
      <motion.div
        className="max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center mt-20">
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-gray-400 text-sm mt-1">
              Order ID: <span className="font-mono">{order._id}</span>
            </p>
            <p className="text-gray-400 text-sm">
              Placed on{dayjs(order.createdAt).format("MMMM D, YYYY")}
            </p>
          </div>
          <span
            className={`mt-4 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${
              order.status === "paid"
                ? "bg-green-600"
                : order.status === "cancelled"
                ? "bg-red-600"
                : "bg-yellow-600"
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.product._id}
              className="bg-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="w-full sm:w-24 h-24 relative border border-gray-700 rounded-lg overflow-hidden">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.product.name}</p>
                {item.size && (
                  <p className="text-gray-400 text-sm">Size: {item.size}</p>
                )}
                <p className="text-gray-400 text-sm">
                  Quantity: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-lg">
                ₹{item.product.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xl font-semibold">
            Total Amount: <span className="text-pink-400">₹{order.totalAmount}</span>
          </p>
          <button
            onClick={() => window.print()}
            className="mt-4 sm:mt-0 bg-pink-600 hover:bg-pink-500 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            Print Receipt
          </button>
        </div>
      </motion.div>
    </main>
  );
}
