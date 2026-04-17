export function PurchasersList({ purchasers = [] }) {
  return (
    <div className="buyers">
      <p>Recent purchasers</p>
      {purchasers.length ? (
        <ul>
          {purchasers.slice(0, 3).map((p, idx) => (
            <li key={`${p.username}-${idx}`}>
              <span>{idx + 1}</span>
              <strong>{p.username}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-purchases">No purchases yet.</div>
      )}
    </div>
  );
}
