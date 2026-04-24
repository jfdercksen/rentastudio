"use client";

import { useState, useEffect, useCallback } from "react";
import BookingsTable from "@/components/admin/BookingsTable";
import BookingDetailModal from "@/components/admin/BookingDetailModal";
import type { Database } from "@/types/database";

type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      if (!res.ok) throw new Error("Failed to load bookings");
      const json = (await res.json()) as { bookings: BookingRow[] };
      setBookings(json.bookings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  function handleSelect(booking: BookingRow) {
    setSelectedBooking(booking);
    setModalOpen(true);
  }

  async function handleStatusChange(id: string, status: string) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: status as BookingRow["status"] } : b
        )
      );
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, status: status as BookingRow["status"] } : null
        );
      }
      setModalOpen(false);
    } else {
      alert("Failed to update booking status. Please try again.");
    }
  }

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 32,
          fontWeight: 300,
          letterSpacing: "-0.02em",
          color: "#0e0d0b",
          marginBottom: 8,
        }}
      >
        Bookings
      </h1>
      <p style={{ fontSize: 14, color: "#8a857a", marginBottom: 32 }}>
        Click any row to view full booking details.
      </p>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e2d6",
          borderRadius: 10,
          padding: "28px",
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8a857a", fontSize: 14 }}>
            Loading bookings…
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#c0392b", fontSize: 14 }}>
            {error}
          </div>
        )}
        {!loading && !error && (
          <BookingsTable bookings={bookings} onSelect={handleSelect} />
        )}
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
