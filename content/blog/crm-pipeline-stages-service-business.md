---
title: "CRM Pipeline Stages for a Service Business (With Automations)"
description: "How to design CRM pipeline stages for a service business, from new lead to review requested, with the automation to run at each stage and example tables."
date: 2026-10-18
category: "CRM & Systems"
keyword: crm pipeline stages service business
image: service-crm.jpg
relatedServices: [crm-build-management, ai-services-automations]
relatedIndustries: [hvac, plumbing, painting, landscaping]
faq:
  - q: "How many stages should a sales pipeline have for a contractor?"
    a: "Most service businesses do well with six to nine stages. Fewer and you can't see where jobs stall; more and nobody keeps them updated. Each stage should represent a real change in what the customer or your team needs to do next."
  - q: "Should I have separate pipelines for sales and jobs?"
    a: "Often, yes. A sales pipeline tracks a lead until it's won or lost, and a jobs or production pipeline tracks scheduling, completion, invoicing and reviews. Small shops can keep it in one pipeline as long as the stages are clear."
  - q: "What is the difference between a pipeline stage and a tag in a CRM?"
    a: "A stage is where an opportunity sits right now, and it can only be in one at a time. Tags are labels that can stack, like the lead source, the service type or 'maintenance plan member.' Use stages for progress and tags for categories."
---

A CRM pipeline is just a picture of how a stranger becomes a paying customer. When the stages match how your business actually runs, you can see at a glance where money is stuck. When they don't, the pipeline turns into a junk drawer that nobody updates.

Here's a stage-by-stage design that fits most service businesses, with the automation that should fire at each step.

## Principles before you build anything

- **One stage, one meaning.** Every stage should answer "what has to happen next, and who does it?" If two stages have the same next step, merge them.
- **Stages are about the customer, not your feelings.** "Hot lead" isn't a stage. "Estimate sent" is.
- **Every stage gets a time limit.** If a lead sits in "Contacted" for five days, something should alert someone.
- **Automations move with the stage.** Moving a card should trigger the right texts, emails and tasks, so nobody has to remember.
- **Won and lost are both real stages.** Lost reasons are some of the most useful data you'll collect.

## The core pipeline

Here's a sales-to-review pipeline that works for HVAC, plumbing, painting, landscaping, remodeling and most other trades with an estimate step.

| Stage | Means | Who owns it | Target time in stage |
|---|---|---|---|
| New lead | Call, form, chat or ad lead came in, no human contact yet | Office / AI receptionist | Minutes |
| Contacted | We reached them and know what they need | Office | 1–2 days |
| Estimate scheduled | Site visit or virtual estimate on the calendar | Estimator | Until appointment |
| Estimate sent | Written quote delivered | Estimator | 7–14 days |
| Won | Customer accepted, deposit or signature received | Office | Until scheduled |
| Lost | Customer declined or went silent past the follow-up window | Office | Closed |
| Job complete | Work done and invoiced | Crew lead / office | 1–3 days |
| Review requested | Review ask sent, waiting on response | Automated | 7 days |

Some businesses add "Job scheduled" between Won and Job complete. Service-call businesses that quote on site (a plumber fixing a leak today) can collapse "Estimate scheduled" and "Estimate sent" into "Dispatched."

## Automations at each stage

This is where a pipeline earns its keep. A stage change should do work for you.

### New lead

- Instant text acknowledging the inquiry, signed with a real name.
- Notify the office by text or app push, with the lead's name, service and source.
- If it came from a missed call, trigger a text-back right away. See [missed call text-back setup](/blog/missed-call-text-back-setup/).
- If nobody moves the card within 15 minutes during business hours, escalate to a manager.

Speed matters most here. We go into why in [speed to lead for home services](/blog/speed-to-lead-home-services/).

### Contacted

- Create a task: "Get photos, address and job details."
- Send a booking link for an estimate if they're ready.
- If they haven't booked in 48 hours, send a follow-up text, then a call task.

### Estimate scheduled

- Confirmation text and email with date, time window and the estimator's name.
- Reminder the day before and the morning of, with a reschedule link.
- "On my way" text when the estimator leaves.

### Estimate sent

This is where most service businesses lose the most money, because nobody follows up. Run a sequence:

1. Day 0: email the estimate with a short text saying it's been sent.
2. Day 2: "Any questions on the estimate?" text from the estimator.
3. Day 5: call task.
4. Day 10: a gentle last check-in.
5. Day 14 to 21: if no answer, move to Lost with reason "No response."

We break down the timing and wording in [estimate follow-up sequences for contractors](/blog/estimate-follow-up-sequence-contractors/).

### Won

- Stop all estimate follow-ups immediately.
- Send a welcome message: what happens next, deposit receipt, expected start window.
- Create the job in your production pipeline or scheduling tool.

### Lost

- Require a lost reason (dropdown, not free text).
- Add them to a long-term nurture list if the reason was price or timing.
- Optional: a short "Mind telling us why?" text. You'll learn a lot.

### Job complete

- Send the invoice and payment link.
- Thank-you text from the crew lead or owner.
- Move automatically to Review requested once paid.

### Review requested

- Review ask by text with a direct link to your Google review form.
- One reminder a few days later if they haven't clicked.
- Notify the owner when a review comes in, and flag anything under four stars for a personal call.

Reviews feed back into your marketing. See [turning Google reviews into marketing](/blog/turning-google-reviews-into-marketing/).

## Lost reasons worth tracking

Use a short fixed list so you can report on it:

| Lost reason | What it tells you |
|---|---|
| Price | Pricing, positioning or the wrong lead source |
| Timing / not ready | Should go to a nurture sequence |
| Went with another company | Speed or follow-up gap |
| No response | Follow-up sequence needs work |
| Out of service area | Ad targeting or website service area is off |
| Not a fit (job too small, wrong service) | Qualifying questions need tightening |

After a few months, the pattern in this table is often more useful than any ad report.

## Fields and tags that make the pipeline usable

A pipeline is only as good as the data on each card. At minimum, capture:

- Service type (drop-down)
- Lead source (set automatically where possible)
- Estimated job value
- Town
- Estimator assigned
- Lost reason

Tag recurring relationships too: maintenance plan members, commercial accounts, past customers. Those tags power later campaigns like seasonal reminders.

## Common mistakes

- **Too many stages.** "Left voicemail 1," "Left voicemail 2" and "Left voicemail 3" are tasks, not stages.
- **No owner per stage.** If everyone owns it, nobody does.
- **Automations that don't stop.** A customer who signed yesterday shouldn't get "Still thinking it over?" today. Every sequence needs a stop condition tied to the stage.
- **Never cleaning up.** Cards that have sat for 90 days should be closed out as lost. A clean pipeline is one you trust.

If you want a broader checklist for picking and setting up a system, start with our [CRM checklist for contractors](/blog/crm-checklist-for-contractors/).

## How RGS helps

We map how your leads actually turn into jobs, then build the pipelines, fields and stage automations around it, usually in GoHighLevel, and manage them month to month. If you're a [painting contractor](/industries/painting/crm-build-management/), an [HVAC company](/industries/hvac/crm-build-management/) or another trade, see our [CRM build and management service](/services/crm-build-management/). Agencies building on GoHighLevel can also look at [RGS Tools](/software/).
