"use client";

import { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Adjust endpoint if yours differs
        const { data } = await axiosInstance.get("order/");
        console.log(data);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading your orders…
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

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6">
        <p className="text-xl">You have no orders yet.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <h1 className="text-3xl mt-15 font-bold mb-8 text-center">Your Orders</h1>
      <div className="space-y-6 max-w-4xl mx-auto">
        {orders.map((order, idx) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-700 p-4">
              <div>
                <p className="font-semibold">Order ID: {order._id}</p>
                <p className="text-gray-400 text-sm">
                  Placed on {dayjs(order.createdAt).format("MMMM D, YYYY")};
                </p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
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
            </div>

            {/* Order Items */}
            <div className="p-4 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.product._id}
                  onClick={() => router.push(`/order/${order._id}`)}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    {item.size && (
                      <p className="text-gray-400 text-sm">Size: {item.size}</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₹{item.product.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="bg-gray-700 p-4 flex flex-col sm:flex-row justify-between items-center">
              <p className="font-semibold text-lg">
                Total: ₹{order.totalAmount}
              </p>
              <button
                onClick={() => window.print()}
                className="mt-2 sm:mt-0 bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-lg font-semibold transition"
              >
                Print Receipt
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
