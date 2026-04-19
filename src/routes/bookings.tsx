import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Ticket,
  Users,
  Wallet,
  X,
  Sparkles,
} from "lucide-react";
import { useBookings, cancelBooking, type Booking } from "@/data/bookings";
import { downloadIcs, downloadAllIcs } from "@/lib/wallet";
import { BottomNav } from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — VibeCheck" },
      { name: "description", content: "Your upcoming reservations and event tickets." },
      { property: "og:title", content: "My Bookings — VibeCheck" },
      { property: "og:description", content: "All your bookings in one place." },
    ],
  }),
  component: BookingsPage,
});

type Tab = "upcoming" | "past";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function BookingsPage() {
  const all = useBookings();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [open, setOpen] = useState<Booking | null>(null);

  const upcoming = all.filter((b) => b.status === "upcoming");
  const past = all.filter((b) => b.status === "past" || b.status === "cancelled");
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="min-h-[100svh] w-full bg-background pb-32">
      <header className="px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <Link
            to="/profile"
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full glass-dark"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.3em] text-accent">
            My Bookings
          </p>
          <div className="w-9" />
        </div>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tighter">
          Tonight & <span className="text-gradient-sunset">beyond</span>
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-2 px-4">
        <div className="glass inline-flex rounded-full p-1">
          {(["upcoming", "past"] as Tab[]).map((t) => {
            const active = t === tab;
            const count = t === "upcoming" ? upcoming.length : past.length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-xs font-display font-bold uppercase tracking-widest transition-all ${
                  active
                    ? "bg-gradient-sunset text-primary-foreground shadow-glow-coral"
                    : "text-foreground/70"
                }`}
              >
                {t} · {count}
              </button>
            );
          })}
        </div>
        {upcoming.length > 0 && (
          <button
            onClick={() => {
              downloadAllIcs(upcoming);
              toast("Calendar exported", {
                description: `${upcoming.length} events added to your .ics`,
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-full glass-dark border border-border/40 px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-widest active:scale-95"
          >
            <CalendarPlus className="h-3.5 w-3.5 text-accent" />
            Export
          </button>
        )}
      </div>

      {/* List */}
      <div className="mt-4 space-y-3 px-4">
        {list.length === 0 ? (
          <div className="glass mt-6 rounded-3xl border border-border/40 p-8 text-center">
            <p className="text-5xl">🎟️</p>
            <p className="mt-2 font-display text-lg font-bold">
              {tab === "upcoming" ? "No bookings yet" : "Nothing here yet"}
            </p>
            <p className="text-xs text-foreground/60">
              {tab === "upcoming"
                ? "Find a vibey spot and lock in a table or ticket."
                : "Past bookings will show up here."}
            </p>
            {tab === "upcoming" && (
              <Link
                to="/"
                className="mt-4 inline-block rounded-full bg-gradient-sunset px-5 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-glow-coral"
              >
                Explore vibes
              </Link>
            )}
          </div>
        ) : (
          list.map((b) => <BookingCard key={b.id} booking={b} onOpen={() => setOpen(b)} />)
        )}
      </div>

      {/* QR Modal */}
      <TicketModal booking={open} onClose={() => setOpen(null)} />

      <BottomNav />
    </div>
  );
}

function BookingCard({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  const isTicket = booking.type === "ticket";
  const cancelled = booking.status === "cancelled";

  return (
    <article
      className={`glass-dark relative overflow-hidden rounded-3xl border border-border/40 shadow-soft ${
        cancelled ? "opacity-60" : ""
      }`}
    >
      <div className="flex">
        <div className="relative h-32 w-28 shrink-0">
          {booking.cover ? (
            <img
              src={booking.cover}
              alt={booking.placeName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-card" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/60" />
          <div className="absolute left-2 top-2 rounded-full glass-dark px-1.5 py-0.5 text-[9px] font-display font-black uppercase tracking-widest">
            {isTicket ? "🎫 Event" : "🍽️ Table"}
          </div>
        </div>
        <div className="flex-1 p-3">
          <h3 className="font-display text-base font-black leading-tight">
            {isTicket ? booking.eventTitle : booking.placeName}
          </h3>
          {isTicket && (
            <p className="text-[11px] uppercase tracking-widest text-foreground/60">
              {booking.placeName}
            </p>
          )}
          <div className="mt-1.5 space-y-0.5 text-[11px] text-foreground/80">
            <p className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 text-accent" />
              {formatDate(booking.date)} · {booking.timeLabel}
            </p>
            {!isTicket && booking.partySize && (
              <p className="inline-flex items-center gap-1">
                <Users className="h-3 w-3 text-accent" />
                Party of {booking.partySize}
              </p>
            )}
            {isTicket && booking.ticketPrice != null && (
              <p className="inline-flex items-center gap-1">
                <Ticket className="h-3 w-3 text-accent" />${booking.ticketPrice}
              </p>
            )}
          </div>
          {cancelled && (
            <p className="mt-1 inline-block rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-widest text-destructive">
              Cancelled
            </p>
          )}
        </div>
      </div>
      {!cancelled && (
        <div className="flex border-t border-border/40 text-[11px] font-display font-bold uppercase tracking-widest">
          <button onClick={onOpen} className="flex-1 py-3 text-primary">
            Show QR
          </button>
          <Link
            to="/place/$slug"
            params={{ slug: booking.placeSlug }}
            className="flex-1 border-x border-border/40 py-3 text-center text-foreground/70"
          >
            Place
          </Link>
          {booking.status === "upcoming" && (
            <button
              onClick={() => {
                cancelBooking(booking.id);
                toast("Booking cancelled", { description: "We let the venue know." });
              }}
              className="flex-1 py-3 text-foreground/60"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function TicketModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {booking && (
        <>
          <motion.button
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass-dark relative overflow-hidden rounded-3xl border border-border/40 shadow-soft">
              {/* Top — venue */}
              <div className="relative h-28 w-full">
                {booking.cover && (
                  <img
                    src={booking.cover}
                    alt={booking.placeName}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass-dark"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute inset-x-0 bottom-2 px-4">
                  <p className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-accent">
                    {booking.type === "ticket" ? "Event Ticket" : "Table Reservation"}
                  </p>
                  <h2 className="font-display text-xl font-black leading-tight">
                    {booking.type === "ticket" ? booking.eventTitle : booking.placeName}
                  </h2>
                </div>
              </div>

              {/* Perforated divider */}
              <div className="relative h-4">
                <div
                  className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background"
                  aria-hidden
                />
                <div
                  className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background"
                  aria-hidden
                />
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 border-t border-dashed border-border/60" />
              </div>

              {/* QR */}
              <div className="space-y-3 px-5 pb-5">
                <div className="mx-auto grid w-fit place-items-center rounded-2xl bg-foreground p-4">
                  <QRCodeSVG
                    value={`vibecheck://booking/${booking.id}/${booking.confirmationCode}`}
                    size={160}
                    bgColor="transparent"
                    fgColor="#1a0d2e"
                    level="M"
                  />
                </div>
                <p className="text-center font-mono text-xs tracking-[0.3em] text-foreground/60">
                  {booking.confirmationCode}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-center">
                  <div className="rounded-2xl bg-gradient-card p-3">
                    <p className="text-[9px] uppercase tracking-widest text-foreground/60">Date</p>
                    <p className="mt-0.5 font-display text-sm font-bold">
                      {formatDate(booking.date)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-card p-3">
                    <p className="text-[9px] uppercase tracking-widest text-foreground/60">
                      <Clock className="mr-0.5 inline h-2.5 w-2.5" /> Time
                    </p>
                    <p className="mt-0.5 font-display text-sm font-bold">{booking.timeLabel}</p>
                  </div>
                  {booking.type === "table" && booking.partySize && (
                    <div className="col-span-2 rounded-2xl bg-gradient-card p-3">
                      <p className="text-[9px] uppercase tracking-widest text-foreground/60">
                        Party
                      </p>
                      <p className="mt-0.5 font-display text-sm font-bold">
                        {booking.partySize} guests
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-accent/15 p-3">
                  <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                  <p className="text-[11px] text-foreground/85">
                    Show this code at the door. Skip the line.
                  </p>
                </div>

                {/* Wallet + Calendar */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      downloadIcs(booking);
                      toast("Added to wallet", {
                        description: "Open the .ics to add to Apple Wallet or Google Pay.",
                      });
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-foreground py-3 text-[11px] font-display font-black uppercase tracking-widest text-background active:scale-95"
                  >
                    <Wallet className="h-4 w-4" />
                    Add to Wallet
                  </button>
                  <button
                    onClick={() => {
                      downloadIcs(booking);
                      toast("Added to calendar", { description: "Event downloaded as .ics" });
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-2xl glass border border-border/40 py-3 text-[11px] font-display font-black uppercase tracking-widest active:scale-95"
                  >
                    <CalendarPlus className="h-4 w-4 text-accent" />
                    Calendar
                  </button>
                </div>

                <Link
                  to="/place/$slug"
                  params={{ slug: booking.placeSlug }}
                  className="flex items-center justify-center gap-2 rounded-full glass py-2.5 text-[11px] font-display font-bold uppercase tracking-widest"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  View venue
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
