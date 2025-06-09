// app/billing/[...id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { loadScript } from "@/lib/loadRazorpay";
import { useAuthStore } from "@/stores/useAuthStore";
import { useModalStore } from "@/stores/useModalStore";

type Product = {
  _id: string;
  name: string;
  images: string[];
  price: number;
};

type CartItem = {
  _id: string;
  product: Product;
  quantity: number;
  size?: string;
};

export default function BillingPage() {
  const router = useRouter();
  const params = useParams();         // { id?: string[] }
  const slug = params.id || [];       // e.g. ["cart"] or ["<productId>"]

  const isCartFlow = slug[0] === "cart";

  // ──────────────────────────────────────────────────────────────────────────
  // Shared state for shipping form:
  // ──────────────────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const {authUser} = useAuthStore();
  const {openLogin} = useModalStore();

  // ──────────────────────────────────────────────────────────────────────────
  // State specific to “direct‐buy”:
  // ──────────────────────────────────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(isCartFlow ? false : true);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // State specific to “cart‐checkout”:
  // ──────────────────────────────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(isCartFlow);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // State for storing whatever “create-order” returned:
  // ──────────────────────────────────────────────────────────────────────────
  //  • razorpayOrderId, razorpayAmount, razorpayCurrency
  //  • orderItems[] (either a single‐item array or the full cart)
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [razorpayAmount, setRazorpayAmount] = useState<number>(0);
  const [razorpayCurrency, setRazorpayCurrency] = useState<string>("INR");
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // ──────────────────────────────────────────────────────────────────────────
  // 1) If direct‐buy, fetch that one product by ID
  // ──────────────────────────────────────────────────────────────────────────

useEffect(() => {
    if (!authUser) {
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
    if (!isCartFlow) {
      const productId = slug[0];
      if (!productId) {
        setErrorProduct("No product ID provided.");
        setLoadingProduct(false);
        return;
      }
      const fetchProduct = async () => {
        try {
          const { data } = await axiosInstance.get(`product/${productId}`);
          setProduct(data.product);
        } catch (err) {
          console.error("Could not load product:", err);
          setErrorProduct("Could not load product.");
        } finally {
          setLoadingProduct(false);
        }
      };
      fetchProduct();
    }
  }, [slug, isCartFlow]);

  // ──────────────────────────────────────────────────────────────────────────
  // 2) If cart‐checkout, fetch the entire cart
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isCartFlow) {
      const fetchCart = async () => {
        setLoadingCart(true);
        try {
          const { data } = await axiosInstance.get("/cart");
          // data.items should be an array of CartItem
          setCartItems(data.items || []);
        } catch (err) {
          console.error("Could not load cart:", err);
          setErrorCart("Could not load cart.");
        } finally {
          setLoadingCart(false);
        }
      };
      fetchCart();
    }
  }, [isCartFlow]);

  // ──────────────────────────────────────────────────────────────────────────
  // 3) Handle form submit for BOTH flows
  // ──────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   

    // If cart flow but cart is empty, abort:
    if (isCartFlow && cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // If direct flow but product failed to load or is missing, abort:
    if (!isCartFlow && (!product || errorProduct)) {
      alert(errorProduct || "Cannot find product.");
      return;
    }

    try {
      // 3a) Call backend “create-order”
      //   • If direct‐buy: send { productId }
      //   • If cart‐checkout: send {}
       if(busy) return;
    setBusy(true);
      const createBody = isCartFlow
        ? {}
        : { productId: product!._id };

      const { data } = await axiosInstance.post("order/create-order", createBody);
      // data.razorpayOrder = { id, amount, currency }
      // data.orderItems    = [ { product, quantity, size, price } ] or multiple

      const { razorpayOrder, orderItems } = data;
      setRazorpayOrderId(razorpayOrder.id);
      setRazorpayAmount(razorpayOrder.amount);
      setRazorpayCurrency(razorpayOrder.currency);
      setOrderItems(orderItems);

      // 3b) Load Razorpay script
      const isLoaded = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!isLoaded) {
        alert("Could not load Razorpay SDK. Are you online?");
        return;
      }

      // 3c) Open Razorpay modal
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Your Store Name",
        description: isCartFlow
          ? `Cart (${cartItems.length} items)—Total ₹${razorpayOrder.amount / 100}`
          : product!.name,
        image: "/your-logo.png",
        order_id: razorpayOrder.id,
        prefill: {
          name: name,
          email: "user@example.com",
          contact: phone,
        },
        theme: { color: "#f472b6" },

        handler: async function (response: any) {
          const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          } = response;

          try {
            // 3d) Verify signature
            const verifyRes = await axiosInstance.post("order/verify", {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            });

            if (verifyRes.data.success) {
              // 3e) Submit final order
              await axiosInstance.post("order/submit", {
                paymentId: razorpay_payment_id,
                shippingDetails: { name, address, phone, pincode },
                orderItems: orderItems,
                fromCart: isCartFlow,
              });

              alert("Order placed successfully!");
              router.push("/");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Error during verify/submit:", err);
            alert("Something went wrong while processing your payment.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setBusy(false);
    } catch (err) {
      setBusy(false);
      console.error("Could not create order:", err);
      alert("Could not create order. Try again.");
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 4) Render
  // ──────────────────────────────────────────────────────────────────────────

  // If direct flow: show product or loading/error
  if (!isCartFlow) {
    if (loadingProduct)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <p>Loading product…</p>
        </div>
      );
    if (errorProduct || !product)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
          <p>{errorProduct || "Product not found."}</p>
        </div>
      );
  }

  // If cart flow: show cart summary or loading/error
  if (isCartFlow) {
    if (loadingCart)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <p>Loading cart…</p>
        </div>
      );
    if (errorCart)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">
          <p>{errorCart}</p>
        </div>
      );
    if (cartItems.length === 0)
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

  // ──────────────────────────────────────────────────────────────────────────
  // 5) Both flows show the same shipping form at bottom,
  //    but above it we either render a “single‐product summary” or a full “cart summary”.
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6 py-10">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl p-6 space-y-6 text-white mt-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          {isCartFlow ? "Checkout Your Cart" : "Checkout Product"}
        </h1>

        {/* ──────────── Summary ──────────── */}
        {isCartFlow ? (
          <div className="bg-gray-700 rounded-xl p-4 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between border-b border-gray-600 pb-2"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h2 className="font-semibold">{item.product.name}</h2>
                    {item.size && (
                      <p className="text-sm text-gray-300">Size: {item.size}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg">
                    ₹{item.product.price} × {item.quantity} ={" "}
                    <span className="font-bold">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-4 text-right text-2xl font-semibold">
              Total:{" "}
              <span className="text-pink-400">
                ₹
                {cartItems.reduce(
                  (sum, it) => sum + it.product.price * it.quantity,
                  0
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4 bg-gray-700 rounded-xl p-4">
            <img
              src={product!.images[0]}
              alt={product!.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h2 className="text-2xl font-semibold">{product!.name}</h2>
              <p className="text-pink-400 text-xl font-bold">
                ₹{product!.price}
              </p>
            </div>
          </div>
        )}

        {/* ──────────── Shipping Form ──────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1">Address</label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-700 focus:outline-none resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1">Pincode</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-700 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full bg-pink-600 hover:bg-pink-500 py-2 rounded-xl font-semibold transition ${busy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
}
