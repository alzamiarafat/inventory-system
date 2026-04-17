export function DropActions({
  dropId,
  isReserved,
  reserveDisabled,
  purchaseDisabled,
  reserving,
  purchasing,
  onReserve,
  onPurchase,
}) {
  return (
    <div className="action-row">
      <button
        onClick={() => onReserve(dropId)}
        disabled={reserveDisabled}
        className="primary-action"
      >
        {reserving ? "Reserving..." : isReserved ? "Reserved" : "Reserve"}
      </button>

      <button
        onClick={() => onPurchase(dropId)}
        disabled={purchaseDisabled}
        className="secondary-action"
      >
        {purchasing ? "Purchasing..." : "Purchase"}
      </button>
    </div>
  );
}
