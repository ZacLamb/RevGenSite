---
title: "Chimney Inspection Reminders: Turn Sweeps Into Annual Customers"
description: Chimney inspection reminders that turn one-time jobs into annual customers. Learn timing, wording, and CRM setup for masons, plus texting rules.
date: "2026-11-24"
category: CRM & Systems
keyword: chimney inspection reminders
image: blog-chimney-inspection-reminders-masonry.jpg
relatedServices:
  - crm-build-management
  - ai-services-automations
relatedIndustries:
  - masonry
faq:
  - q: How often should I remind customers to get a chimney inspected?
    a: Once a year is the standard interval, so build the reminder around each customer's last inspection date rather than a calendar-wide blast. Start the first message six to eight weeks before the date you want them booked, then follow up a couple of times if they haven't responded.
  - q: What should a chimney inspection reminder text say?
    a: "Keep it short and specific: your business name, the customer's first name, that their yearly chimney check is coming up, and one clear way to book. Add a reply option for opting out, and don't use scare language."
  - q: Do I need permission to text past chimney customers?
    a: Yes. Get a clear opt-in when you do the job, and keep a record of it. If you text from a 10-digit business number through software, carrier registration applies too. This is general information, not legal advice, so check your setup with your texting provider or an attorney.
photo:
  id: badb5418-a717-40a8-a294-bb8bb14d338d
  credit: Jonas Nilsson Lee
  license: CC0
  source: https://stocksnap.io/photo/bricks-wall-4YCB0VAY1L
---

You do a chimney repair or a tuckpointing job, the customer is happy, and you never hear from them again. Meanwhile their chimney keeps weathering, and the next mason they call is whoever shows up first in a search. A simple, well-timed reminder system fixes that without any extra selling.

## Why chimney work is built for repeat business

Fireplaces and chimneys are a recurring-maintenance asset, and the industry already has an annual benchmark. NFPA 211 says chimneys, fireplaces, and vents shall be inspected at least once a year and cleaned and repaired if necessary. That is a standard's recommendation, not a Massachusetts law, so keep your wording honest. Say "recommended yearly" rather than "required."

Notice that inspection and cleaning are different things. The annual interval in NFPA 211 applies to inspection, not cleaning. This matters for a mason. Your reminder is about a yearly look at the crown, flashing, mortar joints, cap, and flue, which is exactly where masonry repairs start. You can read more about how that interval is described in this [NFPA 211 overview](https://www.wechimneymasters.com/post/durham-homeowners-regular-chimney-inspections).

The reminder has two jobs:

1. Get the inspection booked.
2. Put you in front of the homeowner when a small repair is still small.

If you want the marketing side of this trade, see [chimney repair marketing for masons](/blog/chimney-repair-marketing-masons/) and [tuckpointing and repointing marketing](/blog/tuckpointing-repointing-marketing-masons/).

## A quick hypothetical on what a reminder list is worth

Say you've done chimney work for 200 homeowners over the last few years. Say a clear reminder gets one in four of them to book a $175 inspection. That's 50 inspections and $8,750 in inspection revenue from people who already know you. Now say one in five of those inspections turns up a repair like a cracked crown or failed flashing. That's 10 repair estimates you didn't pay for in ads. Your numbers will differ, but the arithmetic shows why a list of past customers is worth maintaining.

## What to record on every job so reminders work

A reminder is only as good as the data behind it. Most masons have it scattered across invoices, texts, and memory. Capture these fields in your CRM at job close:

- **Next inspection due date** (last visit plus 12 months)
- **Chimney details:** masonry or factory-built, number of flues, fuel type
- **Inspection level performed** and the findings
- **Photos** of the crown, flashing, and any damage
- **Deferred repairs:** what you recommended and the customer postponed
- **Permission to text**, with the date and where it was collected
- **Preferred contact method:** text, email, or phone call

The deferred-repairs field is the most valuable one. NFPA 211 also calls for a Level 2 inspection on sale of the property, after a change of appliance or fuel, and after a chimney fire. Those are event triggers, so tag customers who bought or sold, switched fuels, or had an incident. A separate follow-up applies to them.

## The reminder sequence

Timing matters in New England. Mortar work, crown repairs, and flashing fixes go better in warmer weather, and a chimney that's used all winter should be checked before heating season. For most customers, that means reminders in late summer for a September or October visit.

| When | Channel | Message goal |
|---|---|---|
| 8 weeks before due date | Email | Friendly heads-up with a booking link |
| 6 weeks before | Text | Short nudge with a link or a reply option |
| 3 weeks before | Text or call | Offer two specific appointment windows |
| After the visit | Email | Findings summary with photos |
| 30 days after, if repairs were deferred | Text | Reminder about the open repair, with a link to approve the estimate |
| 12 months later | Back to step one | Restart the cycle from the new date |

Stop the sequence the moment someone books or replies. Few things annoy a homeowner more than a reminder for an appointment they already scheduled.

### What to say

Write the way you'd talk at the door:

> Hi Dana, it's Mike from [Company]. It's been about a year since we worked on your chimney. Want us to book your yearly check before the weather turns? Reply here or use this link: [link]. Reply STOP to opt out.

Avoid fear language like "your chimney could catch fire." Be factual and useful. If the last inspection found something, mention the specific item, such as "the crown crack we noted last fall." That's more convincing than any generic warning.

## Texting rules to get right (as of 2026)

Reminders by text work well, but there are rules. Verify these with your provider before you send.

- **Consent:** Collect permission to text when you do the job, such as a checkbox on the estimate or work order, and store a record of it.
- **Carrier registration:** If you text customers from a regular 10-digit number, you have to register that traffic under A2P 10DLC before carriers will deliver it. Twilio's documentation says any application that sends SMS or MMS from a 10DLC number to US recipients must register. See [our A2P 10DLC walkthrough](/blog/a2p-10dlc-texting-registration-small-business/) and this [registration guide](https://reverbico.com/blog/a2p-10dlc-registration/) for the details.
- **Opt-outs:** New FCC revocation-of-consent rules take effect on Nov. 25, 2026. Even if your instructions mention only one word, you must recognize and honor all seven standardized keywords: STOP, QUIT, END, REVOKE, OPT OUT, CANCEL, and UNSUBSCRIBE. Details are in this [summary of the FCC changes](https://www.bhfs.com/insight/new-tcpa-revocation-of-consent-rules-take-effect-on-november-25/). Make sure your CRM suppresses anyone who opts out, across every campaign.

For a broader look at texting old customers, see [reactivating past customers with a text campaign](/blog/reactivate-past-customers-text-campaign/).

## How to set this up in a CRM

You don't need anything fancy. Any CRM that can store a date field, trigger messages from it, and stop on a reply will do the job. The setup steps:

1. **Create a "Chimney Inspection Due" date field** and fill it for every past customer you can find.
2. **Build a pipeline** with stages like Reminder Sent, Replied, Scheduled, Inspected, Repair Quoted, and Repair Booked. For more on stage design, see [CRM pipeline stages for a service business](/blog/crm-pipeline-stages-service-business/).
3. **Write the sequence** from the table above and set it to start from the due date.
4. **Add stop rules:** booking, reply, opt-out, or a manual "do not contact" flag.
5. **Add a task for deferred repairs** so someone calls or texts about the open estimate.
6. **Check it monthly:** how many reminders went out, how many booked, how many repair quotes followed.

If you have a backlog of repair work, scheduling reminder-driven bookings alongside it takes some planning. [Masonry waitlist and backlog management](/blog/masonry-contractor-waitlist-backlog/) covers that.

## What to ask any vendor or software before you buy

- Can I trigger messages from a date field on the customer record?
- Does it stop the sequence on a reply or booking?
- Does it log consent and handle all standard opt-out keywords?
- Who handles A2P 10DLC registration, and is it included?
- Can I attach photos and findings to the customer record?
- Can I export my data if I leave?

## How RGS helps

Revenue Generating Solutions builds and manages CRMs for local service businesses, including masons who want inspection reminders, deferred-repair follow-ups, and clean customer records without extra office work. Learn more on our [CRM Build & Management page](/services/crm-build-management/), see how it applies to [masonry CRM setups](/industries/masonry/crm-build-management/), or browse [our masonry industry page](/industries/masonry/). To talk it through, [contact us](/contact/) or call (617) 877-5608.
