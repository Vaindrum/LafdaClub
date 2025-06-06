"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiTrash2,
  FiFlag,
  FiSend,
} from "react-icons/fi";
import { motion } from "framer-motion";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
};

type Comment = {
  _id: string;
  user: { _id: string; username: string };
  text: string;
  likes: string[];
  dislikes: string[];
};

type Review = {
  _id: string;
  user: { _id: string; username: string };
  text: string;
  rating: number;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
};

export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams(); // productId
  const { authUser } = useAuthStore(); // { _id, username } or null
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // New state for comment inputs, keyed by reviewId
  const [commentTextByReview, setCommentTextByReview] = useState<{
    [reviewId: string]: string;
  }>({});

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showReportPrompt, setShowReportPrompt] = useState<
    { reviewId: string } | null
  >(null);
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

  // 2) Fetch reviews (with comments) for this product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axiosInstance.get(`review/reviews/${id}`);
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
    if (!authUser) {
      alert("Please log in to submit a review.");
      return;
    }
    if (!reviewText.trim()) return;

    try {
      await axiosInstance.post("review/create", {
        productId: id,
        text: reviewText,
        rating: reviewRating,
      });
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
      setReviewText("");
      setReviewRating(5);
    } catch (err) {
      console.error("Error creating review:", err);
    }
  };

  // 4) Delete a review
  const handleDeleteReview = async (reviewId: string, authorId: string) => {
    if (!authUser) {
      alert("Please log in to delete your review.");
      return;
    }
    if (authUser._id !== authorId) {
      alert("You can only delete your own reviews.");
      return;
    }
    try {
      await axiosInstance.delete(`review/delete/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  // 5) Like / dislike toggles for review
  const handleToggleLike = async (reviewId: string) => {
    if (!authUser) {
      alert("Please log in to like reviews.");
      return;
    }
    try {
      await axiosInstance.post(`review/like/${reviewId}`);
      setReviews((prev) =>
        prev.map((r) => {
          if (r._id !== reviewId) return r;
          const liked = r.likes.includes(authUser._id);
          const disliked = r.dislikes.includes(authUser._id);
          return {
            ...r,
            likes: liked
              ? r.likes.filter((uid) => uid !== authUser._id)
              : [...r.likes, authUser._id],
            dislikes: disliked
              ? r.dislikes.filter((uid) => uid !== authUser._id)
              : r.dislikes,
          };
        })
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleToggleDislike = async (reviewId: string) => {
    if (!authUser) {
      alert("Please log in to dislike reviews.");
      return;
    }
    try {
      await axiosInstance.post(`review/dislike/${reviewId}`);
      setReviews((prev) =>
        prev.map((r) => {
          if (r._id !== reviewId) return r;
          const liked = r.likes.includes(authUser._id);
          const disliked = r.dislikes.includes(authUser._id);
          return {
            ...r,
            dislikes: disliked
              ? r.dislikes.filter((uid) => uid !== authUser._id)
              : [...r.dislikes, authUser._id],
            likes: liked ? r.likes.filter((uid) => uid !== authUser._id) : r.likes,
          };
        })
      );
    } catch (err) {
      console.error("Error toggling dislike:", err);
    }
  };

  // 6) Report a review
  const handleSubmitReport = async (reviewId: string) => {
    if (!authUser) {
      alert("Please log in to report reviews.");
      return;
    }
    if (!reportReason.trim()) return;
    try {
      await axiosInstance.post("review/report", { reviewId, reason: reportReason });
      setShowReportPrompt(null);
      setReportReason("");
      alert("Review reported.");
    } catch (err) {
      console.error("Error reporting review:", err);
    }
  };

  // 7) Submit a comment under a review
  const handleSubmitComment = async (reviewId: string) => {
    if (!authUser) {
      alert("Please log in to comment.");
      return;
    }
    const text = commentTextByReview[reviewId]?.trim();
    if (!text) return;

    try {
      await axiosInstance.post("comment/create", { reviewId, text });
      // Refresh reviews (which include comments)
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
      // Clear the input for this review
      setCommentTextByReview((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  // 8) Delete a comment
  const handleDeleteComment = async (
    commentId: string,
    commentAuthorId: string
  ) => {
    if (!authUser) {
      alert("Please log in to delete comments.");
      return;
    }
    if (authUser._id !== commentAuthorId) {
      alert("You can only delete your own comments.");
      return;
    }
    try {
      await axiosInstance.delete(`comment/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
    } catch (err) {
      console.error("ERROR DELETING COMMENT:", err);
    }
  };

  // 9) Report a comment
  const handleReportComment = async (commentId: string) => {
    if (!authUser) {
      alert("Please log in to report comments.");
      return;
    }
    const reason = prompt("Reason for reporting:");
    if (!reason?.trim()) return;
    try {
      await axiosInstance.post("comment/report", { commentId, reason });
      alert("Comment reported.");
    } catch (err) {
      console.error("Error reporting comment:", err);
    }
  };

  // 10) Like/dislike a comment
  const handleToggleLikeComment = async (commentId: string) => {
    if (!authUser) {
      alert("Please log in to like comments.");
      return;
    }
    try {
      await axiosInstance.post(`comment/like/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleToggleDislikeComment = async (commentId: string) => {
    if (!authUser) {
      alert("Please log in to dislike comments.");
      return;
    }
    try {
      await axiosInstance.post(`comment/dislike/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${id}`);
      setReviews(data);
    } catch (err) {
      console.error("Error disliking comment:", err);
    }
  };

  if (!product)
    return (
      <div className="text-white p-6 flex items-center justify-center h-screen bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading product…
        </motion.div>
      </div>
    );

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-10 py-8 md:mx-70">
      {/* Product Info */}
      <motion.section
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 md:mt-20 mb-12"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {/* Image */}
        <motion.div
          className="w-full"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-auto max-h-[400px] object-cover rounded-xl border border-gray-700"
          />
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {product.images.map((img, i) => (
              <motion.img
                key={i}
                src={img}
                alt={`thumb-${i}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Replace main image on click
                  setProduct((prev) =>
                    prev
                      ? { ...prev, images: [img, ...prev.images.filter((_, idx) => idx !== i)] }
                      : prev
                  );
                }}
                className={`h-16 w-16 flex-shrink-0 rounded border cursor-pointer ${
                  img === product.images[0]
                    ? "border-pink-500"
                    : "border-gray-600"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          className="space-y-6"
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
          }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold">{product.name}</h1>
          <p className="text-pink-400 text-2xl lg:text-3xl font-semibold">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="text-gray-300">{product.description}</p>
          <p className="text-sm text-gray-500">Category: {product.category}</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <motion.button
              onClick={() => router.push(`/billing/${product._id}`)}
              className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Buy Now
            </motion.button>
            <motion.button
              onClick={() =>
                axiosInstance.post("cart/add", {
                  productId: product._id,
                  quantity: 1,
                })
              }
              className="border border-pink-600 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Add to Cart
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      {/* Reviews Section */}
      <section className="mt-12">
        <h2 className="text-2xl lg:text-3xl font-bold mb-6">User Reviews</h2>

        {loading && (
          <div className="text-gray-400">Loading reviews…</div>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-gray-400">
            No reviews yet. Be the first to review!
          </p>
        )}

        {/* Review List */}
        <div className="space-y-6">
          {reviews.map((r, reviewIdx) => {
            const isAuthor = authUser?._id === r.user._id;
            const userLiked = authUser ? r.likes.includes(authUser._id) : false;
            const userDisliked = authUser
              ? r.dislikes.includes(authUser._id)
              : false;

            return (
              <motion.div
                key={r._id}
                className="bg-gray-800 p-6 rounded-xl border border-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * reviewIdx, duration: 0.3 }}
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div
                    className="cursor-pointer mb-2 sm:mb-0"
                    onClick={() => {
                      router.push(`/review/${r._id}`);
                    }}
                  >
                    <p className="font-semibold text-lg">
                      {r.user.username}
                    </p>
                    <p className="flex items-center text-yellow-400">
                      {"⭐".repeat(r.rating)}
                      <span className="text-gray-400 ml-2">
                        ({r.rating}/5)
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-4 text-gray-400">
                    {/* Like Review */}
                    <button
                      onClick={() => handleToggleLike(r._id)}
                      className="flex items-center gap-1"
                    >
                      <FiThumbsUp
                        className={userLiked ? "text-pink-500" : ""}
                      />
                      <span>{r.likes.length}</span>
                    </button>

                    {/* Dislike Review */}
                    <button
                      onClick={() => handleToggleDislike(r._id)}
                      className="flex items-center gap-1"
                    >
                      <FiThumbsDown
                        className={userDisliked ? "text-pink-500" : ""}
                      />
                      <span>{r.dislikes.length}</span>
                    </button>

                    {/* Report Review */}
                    <button
                      onClick={() => {
                        if (!authUser) {
                          alert("Please log in to report reviews.");
                        } else {
                          setShowReportPrompt({ reviewId: r._id });
                        }
                      }}
                      className="hover:text-pink-400 transition"
                    >
                      <FiFlag />
                    </button>

                    {/* Delete Review */}
                    {isAuthor && (
                      <button
                        onClick={() =>
                          handleDeleteReview(r._id, r.user._id)
                        }
                        className="hover:text-red-500 transition"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>

                {/* Review Text */}
                <p className="mt-3 text-gray-200">{r.text}</p>

                {/* Comments Section */}
                <div className="mt-6 border-t border-gray-700 pt-4 space-y-4">
                  {r.comments.map((c, commentIdx) => {
                    const isCommentAuthor =
                      authUser?._id === c.user._id;
                    const commentLiked = authUser
                      ? c.likes.includes(authUser._id)
                      : false;
                    const commentDisliked = authUser
                      ? c.dislikes.includes(authUser._id)
                      : false;

                    return (
                      <motion.div
                        key={c._id}
                        className="bg-gray-700 p-4 rounded-xl"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * commentIdx, duration: 0.25 }}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div>
                            <p className="font-semibold text-sm">
                              {c.user.username}
                            </p>
                            <p className="mt-1 text-gray-300 text-sm">
                              {c.text}
                            </p>
                          </div>
                          <div className="flex gap-3 text-gray-400 mt-2 sm:mt-0">
                            {/* Like Comment */}
                            <button
                              onClick={() =>
                                handleToggleLikeComment(c._id)
                              }
                              className="flex items-center gap-1 text-sm"
                            >
                              <FiThumbsUp
                                className={
                                  commentLiked ? "text-pink-500" : ""
                                }
                              />
                              <span>{c.likes.length}</span>
                            </button>

                            {/* Dislike Comment */}
                            <button
                              onClick={() =>
                                handleToggleDislikeComment(c._id)
                              }
                              className="flex items-center gap-1 text-sm"
                            >
                              <FiThumbsDown
                                className={
                                  commentDisliked ? "text-pink-500" : ""
                                }
                              />
                              <span>{c.dislikes.length}</span>
                            </button>

                            {/* Report Comment */}
                            <button
                              onClick={() => handleReportComment(c._id)}
                              className="hover:text-pink-400 transition text-sm"
                            >
                              <FiFlag />
                            </button>

                            {/* Delete Comment */}
                            {isCommentAuthor && (
                              <button
                                onClick={() =>
                                  handleDeleteComment(c._id, c.user._id)
                                }
                                className="hover:text-red-500 transition ml-1 text-sm"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Add Comment Input */}
                  {authUser ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentTextByReview[r._id] || ""}
                        onChange={(e) =>
                          setCommentTextByReview((prev) => ({
                            ...prev,
                            [r._id]: e.target.value,
                          }))
                        }
                        placeholder="Write a comment…"
                        className="flex-1 bg-gray-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <motion.button
                        onClick={() => handleSubmitComment(r._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-pink-500 hover:text-pink-400 transition"
                      >
                        <FiSend size={20} />
                      </motion.button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      <a
                        href="/login"
                        className="text-pink-500 underline"
                      >
                        Log in
                      </a>{" "}
                      to comment.
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Create Review Form */}
        {authUser ? (
          <motion.div
            className="mt-12 bg-gray-800 p-6 rounded-xl border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <h3 className="text-xl lg:text-2xl font-semibold mb-4">
              Write a Review
            </h3>
            <form
              onSubmit={handleSubmitReview}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1">Rating (1–5):</label>
                <select
                  value={reviewRating}
                  onChange={(e) =>
                    setReviewRating(+e.target.value)
                  }
                  className="bg-gray-700 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">
                  Your Review:
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Submit Review
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <p className="mt-6 text-gray-400">
            <a href="/login" className="text-pink-500 underline">
              Log in
            </a>{" "}
            to write a review.
          </p>
        )}
      </section>

      {/* Report Prompt Modal */}
      {showReportPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-gray-900 p-6 rounded-xl w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-3">
              Report Review
            </h4>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
              placeholder="Reason for reporting"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportPrompt(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <motion.button
                onClick={() => {
                  handleSubmitReport(showReportPrompt.reviewId);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
              >
                Submit Report
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
