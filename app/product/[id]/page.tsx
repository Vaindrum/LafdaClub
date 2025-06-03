"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore"; // or your own auth hook/store
import { FiThumbsUp, FiThumbsDown, FiTrash2, FiFlag } from "react-icons/fi";
import { motion } from "framer-motion";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
};

type Review = {
  _id: string;
  user: { _id: string; username: string };
  text: string;
  rating: number;
  likes: string[];    // array of user IDs who liked
  dislikes: string[]; // array of user IDs who disliked
};

export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams(); // productId
  const { authUser } = useAuthStore(); // { _id, username }
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showReportPrompt, setShowReportPrompt] = useState<{ reviewId: string } | null>(null);
  const [reportReason, setReportReason] = useState("");

  // 1) Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosInstance.get(`product/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  // 2) Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axiosInstance.get(`reviews/${id}`);
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // 3) Submit a new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      await axiosInstance.post("reviews", {
        productId: id,
        text: reviewText,
        rating: reviewRating,
      });
      // Refresh reviews after creating
      const { data } = await axiosInstance.get(`reviews/${id}`);
      setReviews(data);
      setReviewText("");
      setReviewRating(5);
    } catch (err) {
      console.error("Error creating review:", err);
    }
  };

  // 4) Delete a review
  const handleDeleteReview = async (reviewId: string) => {
    try {
      await axiosInstance.delete(`reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  // 5) Like / dislike toggles
  const handleToggleLike = async (reviewId: string) => {
    try {
      await axiosInstance.post(`reviews/${reviewId}/like`);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                likes: r.likes.includes(authUser!._id)
                  ? r.likes.filter((uid) => uid !== authUser!._id)
                  : [...r.likes, authUser!._id],
                dislikes: r.dislikes.filter((uid) => uid !== authUser!._id),
              }
            : r
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleToggleDislike = async (reviewId: string) => {
    try {
      await axiosInstance.post(`reviews/${reviewId}/dislike`);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                dislikes: r.dislikes.includes(authUser!._id)
                  ? r.dislikes.filter((uid) => uid !== authUser!._id)
                  : [...r.dislikes, authUser!._id],
                likes: r.likes.filter((uid) => uid !== authUser!._id),
              }
            : r
        )
      );
    } catch (err) {
      console.error("Error toggling dislike:", err);
    }
  };

  // 6) Report a review
  const handleSubmitReport = async (reviewId: string) => {
    if (!reportReason.trim()) return;
    try {
      await axiosInstance.post("reviews/report", { reviewId, reason: reportReason });
      setShowReportPrompt(null);
      setReportReason("");
      alert("Review reported.");
    } catch (err) {
      console.error("Error reporting review:", err);
    }
  };

  if (!product) return <div className="text-white p-6">Loading product…</div>;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      {/* Product Info */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Image Carousel */}
        <div>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-[400px] object-cover rounded-xl border border-gray-700"
          />
          <div className="flex mt-4 gap-3">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`thumb-${i}`}
                className={`h-16 w-16 rounded border cursor-pointer ${
                  img === product.images[0] ? "border-pink-500" : "border-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-pink-400 text-2xl font-semibold">₹{product.price}</p>
          <p className="text-gray-400">{product.description}</p>
          <p className="text-sm text-gray-500">Category: {product.category}</p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => router.push(`/billing/${product._id}`)}
              className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Buy Now
            </button>
            <button
              onClick={() => axiosInstance.post("cart/add", { productId: product._id, quantity: 1 })}
              className="border border-pink-600 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold mb-6">User Reviews</h2>

        {/* Loading State */}
        {loading && <p className="text-gray-400">Loading reviews…</p>}

        {/* Review List */}
        {!loading && reviews.length === 0 && (
          <p className="text-gray-400">No reviews yet. Be the first to review!</p>
        )}
        <div className="space-y-6">
          {reviews.map((r) => {
            const isAuthor = authUser?._id === r.user._id;
            const userLiked = r.likes.includes(authUser!._id);
            const userDisliked = r.dislikes.includes(authUser!._id);

            return (
              <motion.div
                key={r._id}
                className="bg-gray-800 p-4 rounded-xl border border-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{r.user.username}</p>
                    <p className="flex items-center text-yellow-400">
                      {"⭐".repeat(r.rating)}{" "}
                      <span className="text-gray-400 ml-2">({r.rating}/5)</span>
                    </p>
                  </div>
                  <div className="flex gap-4 text-gray-400">
                    {/* Like Button */}
                    <button onClick={() => handleToggleLike(r._id)} className="flex items-center gap-1">
                      <FiThumbsUp className={userLiked ? "text-pink-500" : ""} />
                      <span>{r.likes.length}</span>
                    </button>
                    {/* Dislike Button */}
                    <button onClick={() => handleToggleDislike(r._id)} className="flex items-center gap-1">
                      <FiThumbsDown className={userDisliked ? "text-pink-500" : ""} />
                      <span>{r.dislikes.length}</span>
                    </button>
                    {/* Report Button */}
                    <button onClick={() => setShowReportPrompt({ reviewId: r._id })}>
                      <FiFlag />
                    </button>
                    {/* Delete Button (only if author) */}
                    {isAuthor && (
                      <button onClick={() => handleDeleteReview(r._id)} className="ml-2">
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-gray-200">{r.text}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Create Review Form */}
        <motion.div
          className="mt-10 bg-gray-800 p-6 rounded-xl border border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block mb-1">Rating (1–5):</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(+e.target.value)}
                className="bg-gray-700 px-3 py-2 rounded-lg w-full"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Your Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 px-3 py-2 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Submit Review
            </button>
          </form>
        </motion.div>
      </section>

      {/* Report Prompt Modal */}
      {showReportPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <motion.div
            className="bg-gray-900 p-6 rounded-xl w-[90%] max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-3">Report Review</h4>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 px-3 py-2 rounded-lg mb-4"
              placeholder="Reason for reporting"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportPrompt(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSubmitReport(showReportPrompt.reviewId);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
              >
                Submit Report
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
