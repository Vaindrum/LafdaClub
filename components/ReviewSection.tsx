// /components/ReviewSection.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios";
import StarRating from "@/components/StarRating";
import { useModalStore } from "@/stores/useModalStore";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiTrash2,
  FiFlag,
  FiSend,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

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

interface ReviewSectionProps {
  productId: string;
  authUser: { _id: string; username: string } | null;
}

export default function ReviewSection({ productId, authUser }: ReviewSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const {openLogin} = useModalStore();

  // Pagination for reviews (show 3 at a time)
  const [visibleReviewCount, setVisibleReviewCount] = useState(3);

  // Comment‐related state per review
  const [commentsVisible, setCommentsVisible] = useState<{ [reviewId: string]: boolean }>({});
  const [visibleCommentCount, setVisibleCommentCount] = useState<{ [reviewId: string]: number }>({});

  // For new comments keyed by reviewId
  const [commentTextByReview, setCommentTextByReview] = useState<{
    [reviewId: string]: string;
  }>({});

  // For new review (text + rating)
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  // Report‐review prompt state
  const [showReportReviewPrompt, setShowReportReviewPrompt] = useState<{reviewId: string;} | null>(null);
  const [showReportCommentPrompt, setShowReportCommentPrompt] = useState<{commentId: string;} | null>(null);
  const [showDeleteReviewPrompt, setShowDeleteReviewPrompt] = useState<{reviewId: string, authorId: string;} | null>(null);
  const [showDeleteCommentPrompt, setShowDeleteCommentPrompt] = useState<{commentId: string, authorId: string;} | null>(null);
  const [reportReviewReason, setReportReviewReason] = useState("");
  const [reportCommentReason, setReportCommentReason] = useState("");

  const [busyReview, setBusyReview] = useState(false);
  const [busyComment, setBusyComment] = useState(false);
  const [busyReport, setBusyReport] = useState(false);


  // ─── 1) Fetch all reviews for this product ─────────────────────────────────
  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data } = await axiosInstance.get(`review/reviews/${productId}`);
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [productId]);

  // ─── 2) Submit a new review ─────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      toast.info("Login to Post Reviews")
      openLogin();
      return;
    }
    if (!reviewText.trim()) return;

    try {
      setBusyReview(true);
      await axiosInstance.post("review/create", {
        productId,
        text: reviewText,
        rating: reviewRating,
      });
      const { data } = await axiosInstance.get(`review/reviews/${productId}`);
      setReviews(data);
      setReviewText("");
      setReviewRating(5);
      setBusyReview(false);
      toast.success("Review Posted")
      // Reset pagination so that new review appears in the first batch
      setVisibleReviewCount((prev) => Math.max(prev, 3));
    } catch (err) {
      setBusyReview(false);
      toast.error("Error Posting Review")
      console.error("Error creating review:", err);
    }
  };

  // ─── 3) Delete a review ─────────────────────────────────────────────────────
  const handleDeleteReview = async (reviewId: string, authorId: string) => {
    if (!authUser) {
      toast.info("Login to Delete Your Review")
      openLogin();
      return;
    }
    if (authUser._id !== authorId) {
      toast.warn("You Can Only Delete Your Own Review")
      return;
    }
    try {
      await axiosInstance.delete(`review/delete/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setShowDeleteReviewPrompt(null);
      toast.success("Review Deleted")
    } catch (err) {
      toast.error("Error Deleting Review")
      console.error("Error deleting review:", err);
    }
  };

  // ─── 4) Like / dislike a review ─────────────────────────────────────────────
  const handleToggleLike = async (reviewId: string) => {
    if (!authUser) {
      toast.info("Login to Like Reviews")
      openLogin();
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
      toast.error("Error Liking Review")
      console.error("Error toggling like:", err);
    }
  };

  const handleToggleDislike = async (reviewId: string) => {
    if (!authUser) {
      toast.info("Login to Dislike Review")
      openLogin();
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
      toast.error("Error Disliking Review")
      console.error("Error toggling dislike:", err);
    }
  };

  // ─── 5) Report a review ──────────────────────────────────────────────────────
  const handleReportReview = async (reviewId: string) => {
    if (!authUser) {
      toast.info("Login to Report Review")
      openLogin();
      return;
    }
    if (!reportReviewReason.trim()) return;
    try {
      setBusyReport(true);
      await axiosInstance.post("review/report", { reviewId, reason: reportReviewReason });
      setShowReportReviewPrompt(null);
      setReportReviewReason("");
      setBusyReport(false);
      toast.success("Review Reported")
    } catch (err) {
      setBusyReport(false);
      toast.error("Error Reporting Review")
      console.error("Error reporting review:", err);
    }
  };

  // ─── 6) Submit a comment under a review ────────────────────────────────────
  const handleSubmitComment = async (reviewId: string) => {
    if (!authUser) {
      toast.info("Login to Post Comments")
      openLogin();
      return;
    }
    const text = commentTextByReview[reviewId]?.trim();
    if (!text) return;

    try {
      setBusyComment(true);
      await axiosInstance.post("comment/create", { reviewId, text });
      const { data } = await axiosInstance.get(`review/reviews/${productId}`);
      setReviews(data);
      setBusyComment(false);
      setCommentTextByReview((prev) => ({ ...prev, [reviewId]: "" }));
      // Ensure comments stay visible after adding
      setCommentsVisible((prev) => ({ ...prev, [reviewId]: true }));
      setVisibleCommentCount((prev) => ({
        ...prev,
        [reviewId]: Math.max(prev[reviewId] || 0, 3),
      }));
    } catch (err) {
      setBusyComment(false);
      toast.error("Error Posting Comment")
      console.error("Error creating comment:", err);
    }
  };

  // ─── 7) Delete a comment ───────────────────────────────────────────────────
  const handleDeleteComment = async (commentId: string, commentAuthorId: string) => {
    if (!authUser) {
      toast.info("Login to Delete Your Comment")
      openLogin();
      return;
    }
    if (authUser._id !== commentAuthorId) {
      toast.warn("You Can Only Delete Your Own Review")
      return;
    }
    try {
      await axiosInstance.delete(`comment/delete/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${productId}`);
      setReviews(data);
      setShowDeleteCommentPrompt(null);
      toast.success("Comment Deleted")
    } catch (err) {
      toast.error("Error Deleting Comment")
      console.error("Error deleting comment:", err);
    }
  };

  // ─── 8) Report a comment ────────────────────────────────────────────────────
  const handleReportComment = async (commentId: string) => {
    if (!authUser) {
      toast.info("Login to Report Comment")
      openLogin();
      return;
    }
    if (!reportCommentReason.trim()) return;
    try {
      setBusyReport(true);
      await axiosInstance.post("comment/report", { commentId, reason: reportCommentReason });
      setShowReportCommentPrompt(null);
      setReportCommentReason("");
      setBusyReport(false);
      toast.success("Comment Reported")
    } catch (err) {
      setBusyReport(false);
      toast.error("Error Reporting Comment")
      console.error("Error reporting comment:", err);
    }
  };

  // ─── 9) Like / dislike a comment ────────────────────────────────────────────
  const handleToggleLikeComment = async (commentId: string) => {
    if (!authUser) {
      toast.info("Login to Like Comment")
      openLogin();
      return;
    }
    try {
      await axiosInstance.post(`comment/like/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${productId}`);
      setReviews(data);
    } catch (err) {
      toast.error("Error Liking Comment")
      console.error("Error liking comment:", err);
    }
  };

  const handleToggleDislikeComment = async (commentId: string) => {
    if (!authUser) {
      toast.info("Login to Dislike Comment")
      openLogin();
      return;
    }
    try {
      await axiosInstance.post(`comment/dislike/${commentId}`);
      const { data } = await axiosInstance.get(`review/reviews/${productId}`);
      setReviews(data);
    } catch (err) {
      toast.error("Error Disliking Comment")
      console.error("Error disliking comment:", err);
    }
  };

  // ─── Show comments for a review (initial batch of 3) ────────────────────────
  const handleShowComments = (reviewId: string) => {
    setCommentsVisible((prev) => ({ ...prev, [reviewId]: true }));
    setVisibleCommentCount((prev) => ({ ...prev, [reviewId]: 3 }));
  };

  // ─── Show next 3 comments for a review ──────────────────────────────────────
  const handleShowMoreComments = (reviewId: string) => {
    setVisibleCommentCount((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 3,
    }));
  };

  // ─── Show next 3 reviews ───────────────────────────────────────────────────
  const handleShowMoreReviews = () => {
    setVisibleReviewCount((prev) => prev + 3);
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl lg:text-3xl font-bold mb-6">User Reviews</h2>

      {loading && <div className="text-gray-400">Loading reviews…</div>}

      {!loading && reviews.length === 0 && (
        <p className="text-gray-400">No reviews yet. Be the first to review!</p>
      )}

      {/* ─── Review List (slice to visibleReviewCount) ─────────────────────────────── */}
      <div className="space-y-6">
        {reviews.slice(0, visibleReviewCount).map((r, reviewIdx) => {
          const isAuthor = authUser?._id === r.user._id;
          const userLiked = authUser ? r.likes.includes(authUser._id) : false;
          const userDisliked = authUser ? r.dislikes.includes(authUser._id) : false;
          const areCommentsVisible = commentsVisible[r._id] || false;
          const commentSliceCount = visibleCommentCount[r._id] || 0;

          return (
            <motion.div
              key={r._id}
              className="bg-gray-800/60 rounded-2xl p-6"
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
                  <p className="font-semibold text-lg">Review by {r.user.username}</p>
                  <p className="flex items-center text-yellow-400 pt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar
                        key={i}
                        className={i < r.rating ? "text-yellow-500" : "hidden"}
                      />
                    ))}
                  </p>
                </div>
                <div className="flex gap-4 text-gray-400">
                  {/* Like Review */}
                  <button
                    onClick={() => handleToggleLike(r._id)}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <FiThumbsUp className={userLiked ? "text-pink-500 fill-pink-500" : ""} />
                    <span>{r.likes.length}</span>
                  </button>

                  {/* Dislike Review */}
                  <button
                    onClick={() => handleToggleDislike(r._id)}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <FiThumbsDown className={userDisliked ? "text-pink-500 fill-pink-500" : ""} />
                    <span>{r.dislikes.length}</span>
                  </button>

                  {/* Report Review */}
                  <button
                    onClick={() => {
                      if (!authUser) {
                        alert("Please log in to report reviews.");
                      } else {
                        setShowReportReviewPrompt({ reviewId: r._id });
                      }
                    }}
                    className="hover:text-red-500 transition cursor-pointer"
                  >
                    <FiFlag />
                  </button>

                  {/* Delete Review (if author) */}
                  {isAuthor && (
                    <button
                      onClick={() => setShowDeleteReviewPrompt({reviewId:r._id, authorId: r.user._id})}
                      className="hover:text-red-500 transition cursor-pointer"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <p className="mt-3 text-gray-200">{r.text}</p>

              {/* ─── Comments Under This Review ──────────────────────────────────── */}
              {/* If comments are not visible yet but there are comments, show "View comments" */}
              {!areCommentsVisible && r.comments.length > 0 && (
                <button
                  onClick={() => handleShowComments(r._id)}
                  className="mt-4 text-pink-300 hover:text-pink-200 transition"
                >
                  View comments ({r.comments.length})
                </button>
              )}

              {/* If commentsVisible, render slice of comments + "View more comments" */}
              {areCommentsVisible && (
                <div className="mt-6 border-t border-gray-700 pt-4 space-y-4">
                  {r.comments.slice(0, commentSliceCount).map((c, commentIdx) => {
                    const isCommentAuthor = authUser?._id === c.user._id;
                    const commentLiked = authUser ? c.likes.includes(authUser._id) : false;
                    const commentDisliked = authUser
                      ? c.dislikes.includes(authUser._id)
                      : false;

                    return (
                      <motion.div
                        key={c._id}
                        className="bg-gray-700/40 p-4 rounded-xl"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * commentIdx, duration: 0.25 }}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div>
                            <p className="font-semibold text-sm">{c.user.username}</p>
                            <p className="mt-1 text-gray-300 text-sm">{c.text}</p>
                          </div>
                          <div className="flex gap-3 text-gray-400 mt-2 sm:mt-0">
                            {/* Like Comment */}
                            <button
                              onClick={() => handleToggleLikeComment(c._id)}
                              className="flex items-center gap-1 text-sm cursor-pointer"
                            >
                              <FiThumbsUp
                                className={commentLiked ? "text-pink-500 fill-pink-500" : ""}
                              />
                              <span>{c.likes.length}</span>
                            </button>

                            {/* Dislike Comment */}
                            <button
                              onClick={() => handleToggleDislikeComment(c._id)}
                              className="flex items-center gap-1 text-sm cursor-pointer"
                            >
                              <FiThumbsDown
                                className={commentDisliked ? "text-pink-500 fill-pink-500" : ""}
                              />
                              <span>{c.dislikes.length}</span>
                            </button>

                            {/* Report Comment */}
                            <button
                              onClick={() => setShowReportCommentPrompt({commentId: c._id})}
                              className="hover:text-red-500 transition text-sm cursor-pointer"
                            >
                              <FiFlag />
                            </button>

                            {/* Delete Comment (if author) */}
                            {isCommentAuthor && (
                              <button
                                onClick={() =>
                                  setShowDeleteCommentPrompt({commentId:c._id, authorId: c.user._id})
                                }
                                className="hover:text-red-500 transition ml-1 text-sm cursor-pointer"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* "View more comments" button if there are more comments */}
                  {r.comments.length > commentSliceCount && (
                    <button
                      onClick={() => handleShowMoreComments(r._id)}
                      className="mt-2 text-pink-300 hover:text-pink-200 transition"
                    >
                      View more comments
                    </button>
                  )}

                
                </div>
              )}
                {/* Add Comment Input */}
                  {authUser ? (
                    <div className="flex mt-2 items-center gap-2">
                      <input
                        type="text"
                        value={commentTextByReview[r._id] || ""}
                        onChange={(e) =>
                          setCommentTextByReview((prev) => ({
                            ...prev,
                            [r._id]: e.target.value,
                          }))
                        }
                        placeholder={`Reply to ${r.user.username}`}
                        className="flex-1 bg-gray-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <motion.button
                      disabled={busyComment}
                        onClick={() => handleSubmitComment(r._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`text-pink-500 hover:text-pink-400 transition ${busyComment ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <FiSend size={20} />
                      </motion.button>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm mt-2">
                      <a className="text-pink-500 cursor-pointer" onClick={openLogin}>
                        Log in
                      </a>{" "}
                      to comment.
                    </p>
                  )}
            </motion.div>
          );
        })}
      </div>

      {/* ─── "View more reviews" button ─────────────────────────────────────────── */}
      {reviews.length > visibleReviewCount && (
        <div className="flex justify-start mt-6">
          <button
            onClick={handleShowMoreReviews}
            className="px-6 py-2 text-pink-500 rounded-lg transition cursor-pointer"
          >
            View more reviews ({reviews.length - visibleReviewCount})
          </button>
        </div>
      )}

      {/* ─── Write a New Review Form ─────────────────────────────────────────────── */}
      {authUser ? (
        <motion.div
          className="mt-12 bg-gray-800/80 p-6 rounded-xl md:w-180 mx-auto mb-10 md:mb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h3 className="text-xl lg:text-2xl font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex gap-2">
              <label className="block mb-1">Rating:</label>
              <StarRating
                value={reviewRating}
                onChange={(newRating) => setReviewRating(newRating)}
                size={24}
              />
            </div>
            <div>
              <label className="block mb-1">Your Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                className="w-full bg-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <motion.button
            disabled={busyReview}
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition ${busyReview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Submit Review
            </motion.button>
          </form>
        </motion.div>
      ) : (
        <p className="mt-6 text-gray-400">
          <a className="text-pink-500 cursor-pointer" onClick={openLogin}>
            Log in
          </a>{" "}
          to write a review.
        </p>
      )}

      {/* ─── Report Prompt Modal ──────────────────────────────────────────────────── */}
      {showReportReviewPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-gray-900 p-6 rounded-xl w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-3">Report Review</h4>
            <textarea
              value={reportReviewReason}
              onChange={(e) => setReportReviewReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
              placeholder="Reason for reporting"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportReviewPrompt(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
              disabled={busyReport}
                onClick={() => {
                  handleReportReview(showReportReviewPrompt.reviewId);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition ${busyReport ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Submit Report
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {showReportCommentPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-gray-900 p-6 rounded-xl w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-3">Report Comment</h4>
            <textarea
              value={reportCommentReason}
              onChange={(e) => setReportCommentReason(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
              placeholder="Reason for reporting"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportCommentPrompt(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
              disabled={busyReport}
                onClick={() => {
                  handleReportComment(showReportCommentPrompt.commentId);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition ${busyReport ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Submit Report
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteReviewPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-gray-900 p-6 rounded-xl w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-3">Confirm Delete Review</h4>
            <div className="pb-10">
              Are you sure you want to delete your review?
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteReviewPrompt(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                onClick={() => {
                  handleDeleteReview(showDeleteReviewPrompt.reviewId, showDeleteReviewPrompt.authorId);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteCommentPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-gray-900 p-6 rounded-xl w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-3">Confirm Delete Comment</h4>
            <div className="pb-10">
              Are you sure you want to delete your comment?
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteCommentPrompt(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                onClick={() => {
                  handleDeleteComment(showDeleteCommentPrompt.commentId, showDeleteCommentPrompt.authorId);
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition cursor-pointer"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
