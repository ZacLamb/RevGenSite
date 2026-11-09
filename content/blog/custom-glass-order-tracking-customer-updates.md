---
title: "Custom Glass Order Tracking: Keep Customers Updated to Install"
description: "Custom glass order tracking for glazing shops: the pipeline stages, status texts and reminders that keep customers informed from measure to install."
date: "2026-11-09"
category: CRM & Systems
keyword: custom glass order tracking
image: industry-glass.jpg
relatedServices:
  - crm-build-management
  - ai-services-automations
relatedIndustries:
  - glass-glazing
faq:
  - q: How do I keep customers updated on a custom glass order?
    a: Give every order a pipeline stage, and send a short text or email automatically when it moves, such as ordered, received, or install scheduled. Add a manual check-in if the supplier date slips.
  - q: What should a custom glass order tracking sheet include?
    a: "At minimum: job number, customer contact, final measurements and version, glass specs, supplier and PO number, promised ship date, received date, and the install date. A spreadsheet works to start, but it won't message anyone for you."
  - q: Can I take a bigger deposit on custom glass in Massachusetts?
    a: For covered home improvement work, Massachusetts caps the advance deposit at the greater of one-third of the price or the actual cost of special-order or custom-made materials. Have an attorney confirm how it applies to your contracts.
---

The slowest part of a custom glass job is the stretch where nothing visible happens. The measure is done, the deposit is in, the supplier has the order, and the customer is wondering whether anyone remembers them.

Most calls a glazing shop gets during that stretch are "where's my glass?" calls. A simple order tracking setup stops most of them before they happen. Below are the stages, fields and messages we'd put in place for any shop.

## Why the gap between measure and install causes problems

Custom glass has a long, quiet middle. Shower doors, mirrors, tabletops, insulated units and storefront lites are made to size, so the order can't be returned or swapped if something goes wrong. A wrong dimension or a late shipment hurts more than it would on a stock part.

Here is how that gap usually goes wrong:

- **The customer hears nothing for weeks** and assumes the job fell through.
- **The office doesn't know the supplier's ship date** because it's in someone's email.
- **The ETA slips and nobody tells the customer** until they call.
- **The glass arrives and sits** because nobody was assigned to schedule the install.
- **A remake happens** and the customer gets no explanation.

None of these are glass problems. They're information problems, and a CRM is built for that kind of problem. If you're not sure what a CRM should cover, our [CRM checklist for contractors](/blog/crm-checklist-for-contractors/) is a good starting point.

## Build the pipeline around the order, not just the lead

Most contractor pipelines stop at "won." For custom glass, the work starts after the yes. Add stages for the order itself. Our post on [CRM pipeline stages for service businesses](/blog/crm-pipeline-stages-service-business/) covers the general approach. Here's a version for a glazing shop:

| Stage | What triggers the move | Who owns it |
|---|---|---|
| Measured | Tech submits final measurements | Field tech |
| Quote sent | Quote goes out | Office |
| Deposit received | Payment recorded | Office |
| Ordered | PO placed with supplier, ETA entered | Office/purchasing |
| In fabrication or shipped | Supplier confirms | Office/purchasing |
| Received and inspected | Glass checked at the shop for size, chips and specs | Shop |
| Install scheduled | Date and crew assigned | Dispatcher |
| Installed | Tech closes out the job | Field tech |
| Follow-up | Check-in and review request | Office (automated) |

Two rules make this work. Every stage needs one named owner, and a job can't move forward until the required fields are filled in. A card that can't leave "Ordered" without a supplier ETA is how you avoid the "nobody knows when it's coming" problem.

## The fields every glass order needs

Whether you use a CRM or a shared spreadsheet, capture the same data on every order:

1. Job number and customer contact, including the best number for texts.
2. Final measurements, who took them, and the date. If measurements get revised, keep the version history.
3. Glass specs: thickness, tempered or laminated, low-E or tint, edge work, hardware finish.
4. Supplier, PO number and order date.
5. Promised ship date, and the date it was last confirmed.
6. Received date and inspection notes, including photos of any damage.
7. Install date, crew and any access notes such as stairs, parking, or protecting floors.

Make the "last confirmed" date a real field. A supplier ETA that was good three weeks ago isn't information. Pick a rule, such as re-confirming every order at its halfway point, and let the CRM remind the office.

## Decide what the customer hears, and when

Customers don't need a running commentary. They need a message at each point where something changed, plus a promise about what happens next. For a glazing shop, that usually means five messages:

- **Order placed:** "Your glass has been ordered. Typical lead time for this product is X to Y weeks. We'll text you when it arrives."
- **Mid-wait check-in:** only if the lead time is long. Confirm the ETA is still on track.
- **Delay notice:** sent the same day the supplier changes the date, with the new date and a name to call.
- **Glass received:** "Your glass is here and checked. We'll call to schedule install."
- **Install reminder:** the day before, with arrival window and what to clear out of the way.

Use your own real lead times in that first message. Don't promise a number you can't back up, because suppliers' lead times vary by product and season.

Delay notices matter more than any other message. Customers forgive a late order faster than a silent one. If you only automate one thing, automate a task that fires when an ETA changes and prompts someone to contact the customer.

For longer sequences, see our post on [automating follow-up on lost and booked jobs](/blog/automating-follow-up-lost-booked-jobs/).

## Keep the texting side legal and deliverable

If you send status updates by text, two things are worth checking. This isn't legal advice, so run your wording past an attorney.

**Consent.** Under the TCPA, texts that are purely informational generally need prior express consent, while marketing texts need prior express written consent. Consent can be enough for transactional messages when the customer gave their number in a context directly related to the communication, such as providing it when placing an order. Add a line to your quote or contract saying you'll text order and scheduling updates to the number provided. Keep promotions out of status texts, because including promotional content can trigger the stricter written-consent standard. Send review requests and offers as a separate, properly consented message. Also make sure customers can reply to stop texts, and honor it. The FCC has been updating its opt-out rules, so [check the current FCC guidance](https://docs.fcc.gov/public/attachments/DOC-424844A1.pdf).

**Registration.** As of 2026, A2P 10DLC is the carrier registration system that requires businesses sending automated texts from a standard 10-digit number to register their brand and campaigns. Without it, appointment reminders and order confirmations may simply not be delivered. Many shops discover this only after texts stop arriving ([source](https://www.phoneservicenow.com/resources/weekly-news/a2p-10dlc-business-texting-compliance-2026)). Our walkthrough on [A2P 10DLC registration for small businesses](/blog/a2p-10dlc-texting-registration-small-business/) covers the steps. If your CRM handles texting, ask your provider whether registration is done for your number. Don't assume it is.

## Tie the order to the deposit and the contract

Custom orders are where deposits get tense. In Massachusetts, covered home improvement work has a deposit rule that specifically accounts for special-order materials. Mass.gov's sample contract language says an advance deposit can't exceed one-third of the total price or the actual cost of special-order or custom-made material that must be ordered in advance. The statute itself describes it as the greater of those two amounts ([M.G.L. c. 142A, §2](https://law.justia.com/codes/massachusetts/part-i/title-xx/chapter-142a/section-2/); [Mass.gov contract guidance](https://www.mass.gov/info-details/home-improvement-contract-requirements-details-and-sample-language)).

Say a shower enclosure job is $6,000. One-third is $2,000. If the custom glass and hardware cost you $2,800, the rule allows a deposit up to that actual cost instead. The exact limits depend on your contract and the type of work, so confirm with an attorney. The tracking takeaway is that the order record should hold the special-order cost, the PO and the supplier confirmation, so you can document why a deposit is what it is.

Your CRM can also flag the other timing issue: the contract's scheduled start and completion dates versus a supplier ETA that has moved. If those no longer line up, someone should talk to the customer now.

## Handle remakes and breakage without losing the customer

Tempered glass can't be cut or reworked after tempering, so a wrong measurement or a chipped edge usually means a remake. Build that into the process:

1. **Inspect on receipt, before the customer is scheduled.** Check size against the order, edges, and surface damage. Log it.
2. **Photograph problems** and attach them to the order.
3. **Move the card to a "Remake" stage** with its own ETA and a customer message that says what happened and the new date.
4. **Track the cause** (measurement, supplier, shipping, spec change) so you can see patterns.

If the same cause keeps showing up, fix the process. A measure sheet with required fields and a second check on large or unusual pieces usually costs less than one remake. For photo-based quoting upstream of all this, see our post on [photo estimates for glass repair](/blog/photo-estimate-glass-repair/). If you want customers to be able to check status themselves, a clear contact path on your site helps, and our [shower door installer website](/blog/shower-door-installer-website/) piece covers what to put on those pages.

## Start simple this week

You don't need new software to start. In one afternoon:

- List the stages above in a spreadsheet or your current job software.
- Add the ETA and "last confirmed" columns to every open order.
- Write the five customer messages once, in your own voice.
- Assign someone to review every open order each Monday.

Then see what it saves you in phone calls.

## How RGS helps

If you'd rather not build this yourself, our [CRM Build & Management](/services/crm-build-management/) service sets up pipelines, stages and automated customer messages around how your shop works. You can see how that applies to your trade on our [glass and glazing CRM page](/industries/glass-glazing/crm-build-management/), or [get in touch](/contact/) to talk it through.
