---
title: "Missed-Call Text-Back: Setup, Example Texts and Compliance"
description: "How missed-call text-back works for contractors, three example texts, A2P 10DLC and consent basics, and the setup mistakes that cost you jobs."
date: 2026-10-18
category: "AI & Automations"
keyword: missed call text back
image: blog-missed-call-cost.jpg
relatedServices: [ai-services-automations, crm-build-management]
relatedIndustries: [plumbing, hvac, electrical, gutter-pressure-washing]
faq:
  - q: "Is missed-call text-back legal?"
    a: "Generally yes, when it's a one-time reply to someone who just called you, it identifies your business, and it offers a way to opt out. You still need a registered business texting number, and you shouldn't add those callers to marketing campaigns without their consent. Confirm your setup with your attorney or compliance advisor."
  - q: "Do I need A2P 10DLC registration for missed-call text-back?"
    a: "Yes. As of 2026, US carriers block unregistered application-to-person traffic on 10-digit local numbers, so automated texts from your business line need a registered brand and campaign."
  - q: "What happens if the caller was on a landline?"
    a: "The text won't be delivered. Many systems can check whether a number is mobile before sending, and you can route landline callers to a callback task instead."
---

When a homeowner calls a contractor and nobody picks up, most of them don't leave a voicemail. They call the next company on the list. Missed-call text-back is a simple automation that sends a text to that caller within seconds, so the conversation keeps going while you're on a roof, under a sink or driving between jobs. Here's how it works, what to say, and how to stay on the right side of the texting rules.

## How missed-call text-back works

The mechanics are straightforward:

1. A customer calls your business number.
2. The call rings through to you or your team, the same as today.
3. If nobody answers (no answer, busy, or sent to voicemail), the phone system marks it as missed.
4. That triggers an automatic text from the **same number** they called.
5. When they reply, the conversation shows up in a shared inbox, and the right person gets an alert.

For this to work, your business number has to live in a system that can both handle calls and send texts, usually a CRM with built-in phone service or a business phone platform with texting. If your number is a basic cell or landline, you'll either port it into one of those systems or forward calls to a new tracking number that can text.

It's a small piece of a bigger response system. Our post on [speed to lead for home services](/blog/speed-to-lead-home-services/) covers how it fits with form responses, alerts and escalation.

## What the text should say

A good missed-call text does four things: says who you are, acknowledges the call, asks one easy question, and offers a way to opt out. Keep it short, since it's being read on a phone by someone who's probably stressed.

**Example 1: General contractor or trade business**

"Hi, this is [Company]. Sorry we missed your call, we're on a job right now. What can we help you with? Reply here and we'll get right back to you. Reply STOP to opt out."

**Example 2: Emergency trades (plumbing, HVAC, electrical)**

"Hi, it's [Company]. We just missed your call. Is this an emergency? Reply YES and we'll call you right back, or tell us what's going on. Reply STOP to opt out."

**Example 3: Estimate-based work (painting, landscaping, decks)**

"Thanks for calling [Company]! We're with a customer. Are you looking for an estimate? Send your address and a quick description of the project, and we'll get back to you today. Reply STOP to opt out."

Notice what's missing: no links in the first message, no sales pitch, no long paragraph about your history. Links in a first text from an unknown number make people suspicious and can hurt deliverability. Get them replying first.

Adjust by time of day too. After hours, tell them when they'll hear from a person: "Our office opens at 7:30 and we'll call you first thing."

## Compliance basics

This isn't legal advice, but every contractor using automated texting should know these basics as of 2026. Rules change and vary by state, so confirm your setup with your attorney or compliance advisor.

### A2P 10DLC registration

Texts sent from software through a local 10-digit number are "application-to-person" (A2P) messages. US carriers require businesses to register a brand and a campaign through The Campaign Registry, usually handled inside your phone or CRM provider. Since February 1, 2025, carriers have blocked unregistered A2P traffic on 10DLC numbers ([TextBolt's summary](https://textbolt.com/blog/10dlc-compliance/)). Registration typically asks for your legal business name, EIN, a website that matches, a privacy policy and sample messages.

When you register, describe the missed-call text-back use case clearly and include your actual message as a sample. Vague campaign descriptions are a common reason for rejection. Our [A2P 10DLC registration guide](/blog/a2p-10dlc-texting-registration-small-business/) walks through the process.

### Consent and scope

Replying once to someone who just called you is a conversational response to their contact. That's different from adding them to a marketing list. Keep these lines clear:

- The missed-call text should only be about their call.
- Don't add callers to promotional campaigns (seasonal offers, newsletters) unless they've given consent for marketing texts.
- Keep a record of how each contact entered your system and what they agreed to.

### Opt-outs

Include opt-out language and honor it immediately. Under FCC rules that took effect April 11, 2025, consumers can revoke consent by any reasonable means, not just by texting STOP. If someone replies "don't text me," treat it as an opt-out. Most CRMs handle STOP automatically, but someone should watch for plain-language opt-outs too.

### Timing

Missed-call texts go out right after the call, so timing usually isn't an issue. But don't let any follow-up messages in the same automation fire late at night. Keep any additional automated texts within normal daytime hours in the customer's time zone.

## Common mistakes

These are the setup problems we see most often:

- **Nobody watches the inbox.** The text goes out, the customer replies, and the reply sits unread for three hours. Send reply alerts to a phone someone actually checks, and set an escalation if a reply isn't answered within 10 minutes.
- **Texting from a different number.** If the text comes from a number they don't recognize, they won't trust it. Send from the number they called.
- **Not filtering landlines.** Texts to landlines fail silently. Use carrier lookup if your system offers it and create a callback task for landline callers.
- **Texting spam and robocalls.** Your system will happily text every spam caller. Most of it is harmless, but block known spam numbers and don't count them in your reporting.
- **Texting existing customers mid-job.** Someone calling about a job already in progress shouldn't get "What can we help you with?" Use a different message, or skip the text, for contacts with an open job.
- **Double-dipping.** If someone calls back within a minute and you answer, cancel any pending follow-up texts.
- **Skipping registration.** Unregistered texts get filtered or blocked, and you won't always know it.
- **Letting an AI bot run without limits.** If you add AI replies, keep them narrow: gather the issue, address and urgency, then hand off. Don't let it quote prices or promise arrival times.

## How to test before going live

Run through this checklist before you turn it on for real customers:

1. Call your business number from a mobile phone and don't answer. Did the text arrive within a minute?
2. Call from a landline. Did the system skip the text and create a callback task?
3. Reply to the text. Did the reply land in the inbox and alert the right person?
4. Reply STOP. Did the system confirm and block future texts?
5. Call after hours. Did you get the after-hours version of the message?
6. Call from a number that has an open job. Did it behave differently?

Then review missed-call reports weekly. You'll learn when most calls slip through, which often points to a staffing fix as much as an automation fix. For the dollar side of it, read [the cost of a missed call](/blog/cost-of-a-missed-call/).

## How RGS helps

We set up missed-call text-back as part of our [AI Services & Automations work](/services/ai-services-automations/), including the phone setup, A2P registration support, message wording and the alerts that make sure someone replies. It's one of the first things we build for [plumbing](/industries/plumbing/ai-services-automations/) and [HVAC](/industries/hvac/ai-services-automations/) companies. Call (617) 877-5608 or [contact us](/contact/) to get it running.
