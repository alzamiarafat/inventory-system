import { DropCard } from "./DropCard";

export function DropsSection({
  drops,
  loading,
  reservations,
  nowMs,
  username,
  busy,
  onReserve,
  onPurchase,
}) {
  return (
    <section className="drops-section" aria-label="Available drops">
      <div className="section-header">
        <div>
          <p className="eyebrow">Available Now</p>
          <h2>Available</h2>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading drops...</div>
      ) : drops.length === 0 ? (
        <div className="empty-state">No active drops.</div>
      ) : (
        <div className="drop-grid">
          {drops.map((drop) => (
            <DropCard
              key={drop.id}
              drop={drop}
              reservation={reservations[drop.id]}
              nowMs={nowMs}
              username={username}
              busy={busy}
              onReserve={onReserve}
              onPurchase={onPurchase}
            />
          ))}
        </div>
      )}
    </section>
  );
}
