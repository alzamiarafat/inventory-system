export function StockBadge({ availableStock }) {
  const isAvailable = availableStock > 0;

  return (
    <div className={isAvailable ? "stock-pill" : "stock-pill is-out"}>
      {isAvailable ? (
        <>
          <strong>{availableStock}</strong>
          <span>left</span>
        </>
      ) : (
        "Sold out"
      )}
    </div>
  );
}
