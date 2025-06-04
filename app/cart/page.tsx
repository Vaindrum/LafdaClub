// app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";

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

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For disabling buttons while an update/remove is in progress:
  // We’ll store strings like "productId–size" for the item being updated/removed.
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);

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
      alert("Failed to update quantity.");
    } finally {
      setUpdatingKey(null);
    }
  };

  // 4) Handle remove item: calls DELETE /cart/remove
  const handleRemoveItem = async (item: CartItem) => {
    if (!confirm("Remove this item from cart?")) return;
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
      await fetchCart();
    } catch (err) {
      console.error("Could not remove item:", err);
      alert("Failed to remove item.");
    } finally {
      setRemovingKey(null);
    }
  };

  // 5) Proceed to a “checkout” page (cart‐checkout)
  const handleCheckout = () => {
    router.push("/checkout");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading cart…</p>
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
          className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-xl transition"
        >
          Go to Merch Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
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
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-full md:w-32 h-32 object-cover rounded-xl mb-4 md:mb-0"
              />

              {/* Details */}
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-semibold">{item.product.name}</h2>
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
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-xl transition disabled:opacity-50"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    disabled={isUpdating || isRemoving}
                    onClick={() => handleChangeQuantity(item, "increase")}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-xl transition disabled:opacity-50"
                  >
                    +
                  </button>

                  <button
                    disabled={isRemoving || isUpdating}
                    onClick={() => handleRemoveItem(item)}
                    className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-500 rounded-xl transition disabled:opacity-50"
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
          className="mt-4 md:mt-0 bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-xl font-semibold transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
