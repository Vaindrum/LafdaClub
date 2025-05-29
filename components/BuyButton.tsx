"use client";

import { loadScript } from "@/lib/loadRazorpay";
import { axiosInstance } from "@/lib/axios";

type BuyButtonProps = {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  className?: string;
};

export default function BuyButton({ product, className }: BuyButtonProps) {
  const handleBuyNow = async () => {
    const isScriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!isScriptLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const { data } = await axiosInstance.post("order/create-order", {
        amount: product.price,
        productId: product._id,
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: "INR",
        name: "LafdaClub Merch",
        description: product.name,
        image: "/lafda-icon.png",
        order_id: data.order_id,
        handler: function (response: any) {
          axiosInstance.post("order/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          alert("Payment Successful!");
        },
        prefill: {
          name: "Lafda Fan",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#f472b6" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Payment failed to start. Please try again.");
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleBuyNow}
      className={
        className ||
        "mt-4 w-full bg-pink-600 hover:bg-pink-500 py-2 rounded-xl font-semibold transition cursor-pointer"
      }
    >
      Buy Now
    </button>
  );
}
