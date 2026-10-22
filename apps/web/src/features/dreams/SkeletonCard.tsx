export default function SkeletonCard() {
  return (
    <div className="dream-card skeleton">
      <div className="thumb shimmer" />
      <div className="dream-body">
        <div className="shimmer line w70" />
        <div className="shimmer line" />
        <div className="shimmer line w50" />
        <div className="shimmer line w30" />
      </div>
    </div>
  );
}
