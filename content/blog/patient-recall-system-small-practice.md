---
title: Patient Recall System for Small Practices (Without the Spam)
description: "Build a patient recall system small practice owners can run: define lapsed, segment, sequence texts and calls, and stay inside HIPAA and TCPA rules."
date: "2026-11-12"
category: CRM & Systems
keyword: patient recall system small practice
image: industry-healthcare.jpg
relatedServices:
  - crm-build-management
  - ai-services-automations
relatedIndustries:
  - healthcare
faq:
  - q: How often should a small practice contact a lapsed patient?
    a: Keep each recall cycle to three or four touches over roughly a month, using a mix of text, email, and a phone call from staff. After that, stop and mark the patient inactive. Re-check only on a slow schedule, such as once or twice a year.
  - q: Do patient recall texts need written consent?
    a: It depends on the content. As of 2026, texts about a patient's own care generally run on prior express consent, which usually means the patient gave you their number for care. Promotional texts need prior express written consent. Have your compliance advisor confirm where your messages fall.
  - q: Is a recall message considered marketing under HIPAA?
    a: HHS says communications made for the individual's treatment are not marketing, and certain health care operations communications are excluded too. A reminder that a patient is due for their own follow-up fits that. A promotion for something unrelated, or anything paid for by a third party, can change the answer.
relatedIndustriesNote: ""
---

Most small practices have a few hundred patients who were seen once or twice and then quietly disappeared. Nobody decided to leave. They just never rebooked, and nobody asked them to.

A recall system fixes that. It finds patients who are due or overdue, contacts them in a way that feels like care, and stops when they don't respond. Here is how to build one that works without annoying anyone.

## What a recall system actually is

A recall system is a repeatable process with four parts: a rule that defines "due," a list that updates itself, a short message sequence, and a clear stopping point. If you run it from a spreadsheet and a good intention, it will work for two weeks and then lapse like your patients did.

Recall is different from the reminders you send for booked visits. Reminders protect appointments already on the calendar (see [reducing no-shows with appointment reminders](/blog/reduce-no-shows-appointment-reminders/)). Recall brings back people who have no appointment at all.

It's also different from a blast. Blasts go to everyone. Recall goes to specific patients for a specific reason, such as "your six-month check is overdue."

## Step 1: Define "lapsed" by visit type

One cutoff for everyone is the most common mistake. A patient seen for a six-month recall is overdue at seven months. A patient seen for a one-time injury is not lapsed at all. Set the rule per visit type.

| Visit type | "Due" trigger | "Overdue" trigger | Who calls |
|---|---|---|---|
| Routine checkup or cleaning | 6 months after last visit | 8 months, no future appointment | Front desk |
| Chronic care follow-up | Interval set by the provider | 30 days past the interval | Nurse or provider's assistant |
| Treatment plan not finished | 2 weeks after last visit | 6 weeks, plan incomplete | Treatment coordinator |
| One-time acute visit | No recall | No recall | None |
| Annual wellness or screening | 11 months | 13 months | Front desk |

Your providers should set these intervals, not marketing. The intervals are clinical decisions. Your system just enforces them.

## Step 2: Build the list in your CRM

You need three data points per patient: last visit date, visit type, and whether a future appointment exists. The last one matters most. A recall list that includes patients who already rebooked is how you annoy your best patients.

Set up the list in this order:

1. **Pull last visit date and type** from your scheduling or practice management system.
2. **Exclude anyone with a future appointment.** The list should refresh daily so a patient who rebooks drops off right away.
3. **Exclude do-not-contact flags.** That means opt-outs, patients who transferred out, deceased patients, and anyone you've been asked to leave alone.
4. **Tag each patient by contact permission.** Record whether they gave a mobile number for care, whether you have an email, and whether they've agreed to promotional messages. This tag decides which channel you can use.
5. **Assign an owner.** Every overdue patient should have a named staff role responsible for the phone follow-up.

Think of this as pipeline stages for patients: due, contacted, no response, booked, inactive. The logic is the same as in [CRM pipeline stages for a service business](/blog/crm-pipeline-stages-service-business/), just applied to existing patients.

## Step 3: Write messages that read like care

A recall message should answer three questions fast: who is this, why am I hearing from you, and what do I do next. Keep it to logistics and leave out clinical detail. One 2026 guide on patient texting advises limiting message bodies to date, time, place, a reply word, and a callback number. For recall, replace "date and time" with a scheduling link or your front desk number.

A simple four-touch sequence:

1. **Day 0, text:** Name the practice, say the patient is due for their visit, link to scheduling, and include opt-out language.
2. **Day 4, email:** Same ask in a bit more detail, with a booking link and office hours. Don't put diagnosis or treatment details in the body.
3. **Day 10, phone call from staff:** A real person calls. Many patients who ignore a text will book on a two-minute call.
4. **Day 30, mailed postcard or letter:** One last touch on a channel that doesn't depend on texting consent.

Then stop. Move the patient to "inactive" and don't contact them again for a few months. If someone replies "not interested" or "I moved," log it and close the loop. Nothing creates spam complaints faster than a system that keeps going after a clear no.

Keep the tone matter-of-fact. "It's been a while since your last visit and you're due for your checkup" works better than "We miss you! Special offer inside!" The second sounds like a promotion, and as the next section explains, that can change which rules apply.

## Rules to check before you send (as of 2026)

I'm not a lawyer, and your situation may differ, so run this section past your compliance advisor. Here's what to ask about.

**HIPAA.** HHS explains that with limited exceptions, the Rule requires written authorization before protected health information is used for marketing. The same guidance says a communication made for treatment of the individual is not "marketing." A reminder that a patient is due for their own follow-up generally fits there. HHS also notes that treatment communications and certain health care operations activities are excluded from the definition of marketing. Read [HHS's marketing guidance](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/marketing/index.html) and its [FAQ on telling treatment apart from marketing](https://www.hhs.gov/hipaa/for-professionals/faq/how-can-i-distinguish-between-health-care-and-marketing-activities/index.html). The gray area is when a "recall" turns into a promotion for an add-on service or a discount. If anyone outside your practice pays you to send a message, the exceptions generally stop applying.

**TCPA (texting and autodialed calls).** Care-related texts and promotional texts are treated differently. One 2026 summary says appointment reminders and other care texts run on prior express consent, which a patient gives by providing a mobile number for care, while promotional texts need signed written consent. See [that practice-focused guide](https://curogram.com/blog/patient-texting-consent-hipaa-tcpa-rules) for the breakdown. Record when and how each patient gave you their number. Revocation rules are also changing: the FCC adopted a Report and Order updating its consent-revocation rules on September 30, 2026, according to [Bloomreach's 2026 TCPA overview](https://www.bloomreach.com/en/blog/understanding-tcpa-and-ctia-compliance-for-sms-marketing-in-the-us). Ask your vendor how STOP replies are handled and confirm the effective dates with your advisor. Also see our post on [HIPAA and text messaging for small practices](/blog/hipaa-text-messaging-small-practice/).

**A2P 10DLC registration.** If your system texts from a regular 10-digit number, carriers expect registration. Since February 1, 2025, unregistered A2P traffic on long codes is blocked by U.S. carriers, per [Tychron's 2026 guide](https://www.tychron.com/guides/10dlc-registration/). Every sender registers a brand and one or more campaigns, which describe what you send and how people opted in. Our [A2P 10DLC walkthrough](/blog/a2p-10dlc-texting-registration-small-business/) covers the steps. Note that registration governs delivery, while TCPA compliance is a separate question.

**Email (CAN-SPAM).** Commercial email must offer an opt-out, and the FTC says you must honor a recipient's opt-out request within 10 business days. See the [FTC's CAN-SPAM guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business). Separately, check that your email platform is set up to handle patient information, and keep clinical detail out of the message.

## Guardrails that keep it from feeling like spam

Compliance sets the floor. These habits keep patients from tuning you out.

- **Cap touches.** Three or four per cycle, then stop.
- **Honor opt-outs everywhere.** If a patient replies STOP to a text, suppress them from email recall too, unless your counsel advises otherwise.
- **Don't message people with future appointments.** Refresh the list daily.
- **Send during business hours.** A recall text at 9 p.m. feels intrusive.
- **Let patients pick a channel.** Add a "how should we reach you?" field to intake. Our post on [online patient intake forms](/blog/online-patient-intake-forms-small-practice/) covers capturing that at the start.
- **Review replies weekly.** Someone should read the answers. A patient replying "I have cancer, please stop" deserves a human, not an automated "Sorry to see you go!"
- **Ask happy patients for reviews at the right time.** Not in a recall message. Do it after a good visit, as covered in [Google reviews for medical practices](/blog/google-reviews-for-medical-practices/).

## Measure it with simple numbers

You don't need a dashboard to know if recall works. Track four numbers monthly: patients on the overdue list, patients contacted, patients who booked, and opt-outs.

A hypothetical example: say your practice has 1,200 active patients and 20% are overdue, which is 240 people. If one in five books, that's 48 visits. At an average visit value of $150, that's $7,200 in revenue from patients you already earned. Your numbers will differ, but the math is why recall is usually cheaper than any new patient campaign. If you also want to know where new patients come from, see [tracking where your leads come from](/blog/track-where-your-leads-come-from/).

Watch the opt-out rate closely. If it climbs, your messages are too frequent, too promotional, or going to the wrong people. For a broader take on reaching old customers by text, see [reactivating past customers with a text campaign](/blog/reactivate-past-customers-text-campaign/), though patient messaging has stricter rules than most trades.

## How Revenue Generating Solutions can help

If you'd rather not build this yourself, our [CRM Build & Management](/services/crm-build-management/) service sets up the pipeline stages, lists, and follow-up workflows described above. See how it applies to [healthcare and wellness practices](/industries/healthcare/) and on our [healthcare CRM page](/industries/healthcare/crm-build-management/). For help with the automated parts, there's also [AI Services & Automations](/services/ai-services-automations/). Call (617) 877-5608 or [contact us](/contact/) to talk through your setup. We'll tell you plainly if a simpler fix would do.
