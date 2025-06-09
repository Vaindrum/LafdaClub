// app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import Loading from "@/components/Loading";
import { useModalStore } from "@/stores/useModalStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

type Product = {
  _id: string;
  name: string;
  images: string[];
  price: number;
};

type CartItem = {
  _id: string;           // cart‐item document ID (not used for update/remove)
  product: Product;
  quantity: number;
  size?: string;
};

export default function CartPage() {
  const router = useRouter();

  const {authUser} = useAuthStore();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For disabling buttons while an update/remove is in progress:
  // We’ll store strings like "productId–size" for the item being updated/removed.
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const {openLogin} = useModalStore();
  
  const [showDeletePrompt, setShowDeletePrompt] = useState<CartItem | null>(null);

useEffect(() => {
    if (!authUser) {
      toast.info("Login to View Your Cart")
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

  // 1) Fetch the user’s cart
  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("cart/");
      // data should be the cart object, with data.items = CartItem[]
      setCartItems(data.items || []);
    } catch (err) {
      console.error("Could not load cart:", err);
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2) Compute total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Helper to build a unique key for each item: “productId–size”
  const getItemKey = (item: CartItem) => {
    return item.size ? `${item.product._id}–${item.size}` : item.product._id;
  };

  // 3) Handle quantity change: calls PUT /cart/update
  const handleChangeQuantity = async (item: CartItem, action: "increase" | "decrease") => {
    const key = getItemKey(item);
    setUpdatingKey(key);

    try {
      await axiosInstance.put("cart/update", {
        productId: item.product._id,
        size: item.size,
        action,
      });
      await fetchCart();
    } catch (err) {
      console.error("Could not update quantity:", err);
      toast.error("Failed to Update Quantity")
    } finally {
      setUpdatingKey(null);
    }
  };

  // 4) Handle remove item: calls DELETE /cart/remove
  const handleRemoveItem = async (item: CartItem) => {
    const key = getItemKey(item);
    setRemovingKey(key);

    try {
      // Axios DELETE with a request body requires { data: { ... } }
      await axiosInstance.delete("cart/remove", {
        data: {
          productId: item.product._id,
          size: item.size,
        },
      });
      setShowDeletePrompt(null);
      toast.success("Item Removed From Cart")
      await fetchCart();
    } catch (err) {
      console.error("Could not remove item:", err);
      toast.error("Failed to Remove Item From Cart")
    } finally {
      setRemovingKey(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p><Loading /></p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-6">
        <p className="text-xl mb-4">Your cart is empty.</p>
        <button
          onClick={() => router.push("/merch")}
          className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-xl transition cursor-pointer"
        >
          Go to Merch Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="md:mx-70">

      <h1 className="text-4xl font-bold mb-8 text-center mt-15">Your Cart</h1>

      <div className="space-y-6">
        {cartItems.map((item) => {
          const key = getItemKey(item);
          const isUpdating = updatingKey === key;
          const isRemoving = removingKey === key;

          return (
            <div
            key={item._id}
            className="flex flex-col md:flex-row bg-gray-800 rounded-xl p-4 md:items-center md:space-x-4"
            >
              {/* Product Image */}
              <img
              onClick={() => router.push(`/product/${item.product._id}`)}
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-full md:w-32 h-32 object-cover rounded-xl mb-4 md:mb-0 cursor-pointer"
                />

              {/* Details */}
              <div className="flex-1 space-y-2">
                <h2 onClick={() => router.push(`/product/${item.product._id}`)} className="text-2xl font-semibold cursor-pointer">{item.product.name}</h2>
                {item.size && (
                  <p className="text-sm text-gray-300">
                    Size: <span className="text-white">{item.size}</span>
                  </p>
                )}
                <p className="text-lg">
                  Price: ₹{item.product.price} × {item.quantity} ={" "}
                  <span className="font-bold">
                    ₹{item.product.price * item.quantity}
                  </span>
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={isUpdating || isRemoving}
                    onClick={() => handleChangeQuantity(item, "decrease")}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    disabled={isUpdating || isRemoving}
                    onClick={() => handleChangeQuantity(item, "increase")}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                    +
                  </button>

                  <button
                    disabled={isRemoving || isUpdating}
                    onClick={() => setShowDeletePrompt(item)}
                    className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-500 rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with Total & Checkout */}
      <div className="mt-10 flex flex-col md:flex-row items-center justify-between bg-gray-800 rounded-xl p-6">
        <div className="text-2xl font-semibold">
          Total: <span className="text-pink-400">₹{totalPrice}</span>
        </div>
        <button
           onClick={() => router.push(`/billing/cart`)}
           className="mt-4 md:mt-0 bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-xl font-semibold transition cursor-pointer"
           >
          Proceed to Checkout
        </button>
      </div>
          </div> 

          {showDeletePrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <motion.div
              className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-lg font-semibold mb-3">
                Confirm Remove Item
              </h4>
              <div className="pb-10">
                Are you sure you want to remove this item from your cart?
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeletePrompt(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveItem(showDeletePrompt)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </div>
  );
}
