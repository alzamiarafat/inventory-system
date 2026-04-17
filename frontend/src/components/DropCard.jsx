import { DropActions } from "./DropActions";
import { HoldMeter } from "./HoldMeter";
import { PurchasersList } from "./PurchasersList";
import { StockBadge } from "./StockBadge";
import { money, secondsLeft } from "../lib/format";

export function DropCard({
  drop,
  reservation,
  nowMs,
  username,
  busy,
  onReserve,
  onPurchase,
}) {
  const remaining = reservation ? secondsLeft(reservation.expiresAt, nowMs) : 0;
  const reserveBusy = !!busy[`reserve:${drop.id}`];
  const purchaseBusy = !!busy[`purchase:${drop.id}`];
  const hasUsername = !!username.trim();
  const isReserved = !!reservation;

  const reserveDisabled = reserveBusy || isReserved || drop.availableStock <= 0;
  const purchaseDisabled =
    purchaseBusy || !isReserved || remaining <= 0 || !hasUsername;

  return (
    <article className="drop-card">
      <div className="drop-card-top">
        <div>
          <p className="drop-kicker">Drop #{drop.id}</p>
          <h3>{drop.name}</h3>
          <p className="price">{money(drop.price)}</p>
        </div>
        <StockBadge availableStock={drop.availableStock} />
      </div>

      <HoldMeter remaining={remaining} isReserved={isReserved} />

      <DropActions
        dropId={drop.id}
        isReserved={isReserved}
        reserveDisabled={reserveDisabled}
        purchaseDisabled={purchaseDisabled}
        reserving={reserveBusy}
        purchasing={purchaseBusy}
        onReserve={onReserve}
        onPurchase={onPurchase}
      />

      <PurchasersList purchasers={drop.latestPurchasers} />
    </article>
  );
}
