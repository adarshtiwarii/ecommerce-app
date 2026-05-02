const StarRating = ({ rating, reviews }) => {
  const getRatingColor = (r) => {
    if (r >= 4) return 'bg-green-600';
    if (r >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 text-white text-xs font-bold px-2 py-0.5 rounded ${getRatingColor(rating)}`}>
        {rating} ★
      </span>
      {reviews && <span className="text-gray-500 text-xs">{reviews.toLocaleString()} Ratings</span>}
    </div>
  );
};

export default StarRating;