import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { API_BASE_URL } from "./api/client";
import {
  fetchActiveDrops,
  fetchActiveReservations,
  purchaseReservation,
  reserveDrop,
} from "./api/dropsApi";
import { AppShell } from "./components/AppShell";
import { DropsSection } from "./components/DropsSection";
import { PageHeader } from "./components/PageHeader";

export default function App() {
  const [username, setUsername] = useState("");
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [reservations, setReservations] = useState({});
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    window.localStorage.removeItem("username");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [nextDrops, nextReservations] = await Promise.all([
          fetchActiveDrops(),
          fetchActiveReservations(username),
        ]);
        if (cancelled) return;
        setDrops(nextDrops);
        setReservations(nextReservations);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load drops");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // Run once on mount. Username changes hydrate reservations in the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchActiveReservations(username)
      .then((nextReservations) => setReservations(nextReservations))
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ["websocket"] });

    socket.on("dropsChanged", () => {
      fetchActiveDrops()
        .then((nextDrops) => setDrops(nextDrops))
        .catch(() => {});
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      setReservations((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const [dropId, reservation] of Object.entries(prev)) {
          const expiresAt = new Date(reservation.expiresAt).getTime();
          if (!Number.isNaN(expiresAt) && expiresAt <= now) {
            delete next[dropId];
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    }, 250);
    return () => clearInterval(t);
  }, []);

  async function reserve(dropId) {
    if (!username.trim()) return toast.error("Enter a username first");

    setBusy((prev) => ({ ...prev, [`reserve:${dropId}`]: true }));
    try {
      const data = await reserveDrop(dropId, username);
      setReservations((prev) => ({ ...prev, [dropId]: data.reservation }));
      toast.success("Reserved. You have 60 seconds to purchase.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reserve failed");
    } finally {
      setBusy((prev) => ({ ...prev, [`reserve:${dropId}`]: false }));
    }
  }

  async function purchase(dropId) {
    const reservation = reservations[dropId];
    if (!reservation) return toast.error("No active reservation");
    if (!username.trim()) return toast.error("Enter a username first");

    setBusy((prev) => ({ ...prev, [`purchase:${dropId}`]: true }));
    try {
      await purchaseReservation(reservation.id, username);
      setReservations((prev) => {
        const next = { ...prev };
        delete next[dropId];
        return next;
      });
      toast.success("Purchase complete");
    } catch (error) {
      const message = error?.response?.data?.message || "Purchase failed";
      if (message.toLowerCase().includes("expired")) {
        setReservations((prev) => {
          const next = { ...prev };
          delete next[dropId];
          return next;
        });
      }
      toast.error(message);
    } finally {
      setBusy((prev) => ({ ...prev, [`purchase:${dropId}`]: false }));
    }
  }

  return (
    <AppShell>
      <PageHeader username={username} onUsernameChange={setUsername} />

      <DropsSection
        drops={drops}
        loading={loading}
        reservations={reservations}
        nowMs={nowMs}
        username={username}
        busy={busy}
        onReserve={reserve}
        onPurchase={purchase}
      />
    </AppShell>
  );
}
