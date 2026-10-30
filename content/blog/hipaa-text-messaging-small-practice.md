---
title: HIPAA Compliant Text Messaging for a Small Practice
description: "How a small practice can text patients under HIPAA: what to put in a message, when you need a BAA, how consent works, and where A2P 10DLC and TCPA fit."
date: "2026-10-30"
category: AI & Automations
keyword: hipaa compliant text messaging small practice
image: blog-automating-followup.jpg
relatedServices:
  - ai-services-automations
  - crm-build-management
relatedIndustries:
  - healthcare
faq:
  - q: Can a small practice text patients under HIPAA?
    a: Yes, if you apply reasonable safeguards. That means limiting what each message says, using a vendor that signs a business associate agreement when messages contain PHI, and documenting what the patient asked for. This isn't legal advice, so have your compliance advisor review your setup.
  - q: Is there such a thing as a HIPAA certified texting app?
    a: No. No government agency certifies texting platforms, so a vendor's 'HIPAA compliant' label is their own claim. What you can check is whether they will sign a BAA and what safeguards they offer.
  - q: Does A2P 10DLC registration make my texts HIPAA compliant?
    a: No. A2P 10DLC is a carrier registration that gets your business texts delivered, and it is separate from HIPAA. You still need to handle message content, consent and vendor agreements yourself.
---

Patients would rather get a text than a voicemail, and most practices know it. The worry is that one wrong message could reveal a diagnosis to the wrong person. HIPAA doesn't ban texting, but it does expect you to set it up on purpose. This is general information, not legal advice, so run your final setup past a compliance advisor.

## What HIPAA actually says about texting patients

HHS's FAQ on electronic communication covers email, not text specifically. It says the Privacy Rule allows covered providers to communicate electronically with patients, provided they apply reasonable safeguards. It also points to limiting the amount or type of information disclosed over an unencrypted channel. Compliance guides generally apply the same logic to SMS. Read the [HHS FAQ](https://www.hhs.gov/hipaa/for-professionals/faq/does-hipaa-permit-health-care-providers-to-use-email-to-discuss-health-issues-with-patients/index.html) yourself.

The same FAQ says patients can ask you to communicate by alternative means if reasonable, such as appointment reminders by email instead of a postcard. A patient who says "just text me" is making a request you should take seriously.

Two more points matter:

- **Plain SMS isn't encrypted.** One psychiatry association guide says patients can use unencrypted texts only after being warned of the risks and consenting, and both the warning and consent must be documented. See the [APA's rules of the road](https://www.psychiatry.org/psychiatrists/practice/telepsychiatry/blog/texting-patients-rules-of-the-road).
- **Nobody certifies apps.** No agency, including HHS's Office for Civil Rights, certifies a texting platform as HIPAA compliant. There is no official seal or list of approved apps. That comes from [Curogram's 2026 guide](https://curogram.com/blog/best-practices/patient-communication/hipaa-secure-texting-requirements-guide). Treat a vendor's label as a sales claim.

Also check whether HIPAA applies to you at all. Many wellness practices that never bill insurance electronically may fall outside it, but that is a question for your advisor. Even if you're outside HIPAA, the same habits protect patients and your reputation.

## What belongs in a text (and what doesn't)

The simplest rule is that a text should be safe to read on a locked screen over someone's shoulder. Put detail behind a secure link or portal login.

| Message type | Fine in a plain text | Move to a secure link or portal |
|---|---|---|
| Appointment reminder | "Reminder: you have an appointment tomorrow at 2:15 PM. Reply C to confirm." | Visit reason, provider specialty, prep instructions |
| Intake | "Please complete your forms before your visit: [link]" | The form itself, behind identity verification |
| Billing | "You have a balance with our office. Pay here: [link]" | Itemized charges, procedure names |
| Results | "A message is waiting in your portal." | The results, any numbers, any diagnosis |
| Scheduling | "We have an opening Thursday at 9. Want it?" | Anything about why they need to come in |

Your sender name counts too. Compliance guides note that a name like "Valley Oncology" already reveals more than "Valley Medical." If your practice name signals a condition, consider a more general text sender name and talk it through with your advisor.

## Four things to have in place

1. **A signed BAA with any vendor that handles message content.** A business associate agreement is required whenever a vendor creates, receives, maintains, or transmits PHI for a covered entity. Your phone carrier is not your business associate and won't sign one. If a vendor won't sign, don't send PHI through it. Also read the breach clause. HIPAA lets a business associate take up to 60 calendar days to report a breach, so ask for notice within a few business days.
2. **Documented consent and preferences.** Add a text section to your intake form. Record the patient's mobile number, what you may text about, and that they were warned plain SMS isn't encrypted. Record opt-outs the same way.
3. **Minimum necessary content.** Build message templates so staff aren't typing clinical detail from scratch.
4. **Staff rules.** Decide who can text patients, from which number, and on what devices. Compliance checklists suggest double-checking the patient's phone number and confirming it by text before sending ePHI. Write down what staff do when a text goes to the wrong person, and don't wait for that day to figure it out.

### Sample consent wording

Adapt this with your advisor:

- "I agree to receive appointment reminders, scheduling messages and links to forms by text at the number above."
- "I understand regular text messages are not encrypted and could be seen by others."
- "I can stop texts at any time by replying STOP or telling the office."
- "Texting is not for emergencies. In an emergency, call 911."

## Where A2P 10DLC and TCPA fit

These are separate from HIPAA, and mixing them up causes trouble.

**A2P 10DLC** is carrier registration for business texts sent from local numbers. Without registration, carriers filter or block your messages. It has two parts: brand registration (your business identity) and campaign registration (your use case, sample messages and opt-in proof). It is only one part of SMS compliance, and in healthcare, HIPAA applies on top. Don't put PHI in your sample messages, and make sure your consent form matches what you register. As of 2026, Twilio requires privacy policy and terms URLs for new campaigns registered through its API. Other platforms have similar requirements, so check yours. Our guide to [A2P 10DLC registration](/blog/a2p-10dlc-texting-registration-small-business/) walks through the steps.

**TCPA** is the federal law on automated texts. One 2026 summary puts it this way: the healthcare exemption waives written consent, not consent. You still need the patient's agreement to be texted. Messages that are marketing need prior express written consent. Think "we haven't seen you in a while, book a cleaning" or a promotion. Ask counsel where your recall messages fall. See [Rivvi's TCPA healthcare overview](https://rivvi.ai/resources/blog/tcpa-compliance-healthcare) for the details.

Opt-outs have changed too. Since April 2025, consumers may revoke consent through any reasonable method, not just the word STOP. One 2026 summary says you must honor a revocation within 10 business days. On September 30, 2026, the FCC adopted an order amending its consent revocation rules for robocalls and texts. Check the effective date and what it means for informational messages before you finalize your opt-out process. The [Lexology summary](https://www.lexology.com/library/detail.aspx?g=16c4153a-e7e3-413e-a62f-dfaf877c67f2) is a good starting point.

One more as-of-2026 note. The big HIPAA Security Rule update is still only a proposal. HHS says the current Security Rule remains in effect, and the final action date is listed as July 2027. Don't wait for it to build good habits.

## Mistakes small practices make

- Texting from the front desk's personal cell phone with no shared policy.
- Using a free or consumer messaging app that won't sign a BAA.
- Letting staff free-type "your biopsy came back" style messages.
- Sending recall promotions under the same consent as appointment reminders.
- Ignoring "please stop texting me" because it didn't say STOP.
- Registering a 10DLC campaign, then sending messages that don't match it.

## Automate the safe messages first

The messages that carry the least risk are also the ones that save the most time: confirmations, reminders, intake links and a text back after a missed call. Build them as fixed templates with merge fields for date and time only. That keeps clinical detail out of the message and keeps staff from improvising.

If no-shows are your main problem, start with our guide to [appointment reminders that reduce no-shows](/blog/reduce-no-shows-appointment-reminders/). For intake, see [online patient intake forms for a small practice](/blog/online-patient-intake-forms-small-practice/). For after-hours calls, see [missed-call text-back setup](/blog/missed-call-text-back-setup/). If you want to see how this plays out in a practice, our [healthcare AI and automation page](/industries/healthcare/ai-services-automations/) covers it.

## How RGS can help

Revenue Generating Solutions is a marketing and technology company for local service businesses, including healthcare and wellness practices. If you want reminders, confirmations and intake links running automatically, our [AI Services & Automations](/services/ai-services-automations/) page explains what we build and how we work. Whoever builds it, settle the BAA and consent steps with your compliance advisor first. You can also see how we work with [healthcare practices](/industries/healthcare/) or [get in touch](/contact/).
