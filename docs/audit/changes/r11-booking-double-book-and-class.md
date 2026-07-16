# Booking availability — no double-booking, and real group-class seats (R11)

_Area: the public booking page (Calendar › Bookings › Preview)._

## How it was

The Wave-4 "calendar-first" rebuild promised that a booker only ever sees times you are actually free — no double-booking. It mostly delivered, but two holes remained:

- **Calendar-native meetings didn't block booking slots.** The app has two stores: your **bookings** (made through a booking link) and your **calendar** (events you add yourself, or meetings scheduled from a Contact/Deal page). Availability only looked at the bookings store. So if you put a meeting on your own calendar for Monday 10:00, the booking page still offered Monday 10:00 to strangers — and would happily double-book you.

- **A group/class event was capped at one attendee.** Booking a seat quietly wrote a "meeting" for the host, which then made the host look *busy* — so the slot disappeared for the next person. A 20-seat webinar could only ever be booked once. Meanwhile the "N of 20 seats left" label was a made-up number (a hash of the date and time), unrelated to how many people had actually signed up.

## How it is now

- **The two stores are merged for availability.** The booking page now checks your real bookings **and** your calendar meetings when deciding what's free, so a meeting anywhere on your calendar blocks the matching slot (and counts toward your daily meeting cap). No more double-booking.

- **Group classes have a real seat model.** Each class booking is tagged with its event, a real counter tallies actual reservations, and a slot stays open until it genuinely reaches capacity — while still respecting the host's *other* commitments (a real 1:1 or an external-calendar block still closes it). The "N of 20 left" figure is now the true remaining count. _Verified live: the demo webinar now offers every 9 AM–4 PM slot at "20 of 20 left."_

## Why this is better

Double-booking is the one thing a scheduling tool must never do — it erodes trust the first time it happens. Reading your whole calendar (not just booking-link bookings) closes the last gap in the "calendar-first" promise. And a group class that can only take one person isn't a group class; tying seats to real reservations makes the capacity you advertise the capacity you actually get, and makes the "seats left" number honest.

## What you (owner) still need to decide

- **Should a scheduled *call* (not just a "meeting") also block booking slots?** Right now only calendar events of type *meeting* block. A timed call is arguably also a conflict — say the word and it's a one-line addition.
- **Class daily-cap behavior.** A class is now exempt from your per-day meeting cap (its own capacity governs instead), because otherwise each seat would count against the cap and close the day early. If you'd rather a class session count as *one* toward the daily cap, that's a small tweak.
- The **write-destination** for a connected calendar (which account a new event is written to) is modeled and saved, but there's no real external-calendar write in the prototype, so it's currently informational only. Wiring it up is backend work for later.
