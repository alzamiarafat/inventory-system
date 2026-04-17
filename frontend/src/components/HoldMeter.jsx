export function HoldMeter({ remaining, isReserved }) {
  const holdPercent = isReserved ? (remaining / 60) * 100 : 100;

  return (
    <div className={isReserved ? "hold-meter is-active" : "hold-meter"}>
      <span>
        {isReserved ? `Hold expires in ${remaining}s` : "Ready for reservation"}
      </span>
      <div>
        <i style={{ width: `${holdPercent}%` }} />
      </div>
    </div>
  );
}
