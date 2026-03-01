+++
title = "Email Is (Very) Hard"
date = "2025-11-12T16:47:25-08:00"
description = "My move from Loops to a custom-built Resend-based solution."
draft = "false"
tags = ["email","hugo","programming","js","html","css","web"]
+++
#### **TL;DR** I made replaced Loops with a custom resend-based solution. I opensourced it and called it [resender](https://github.com/dropalltables/resender).

Email may be the most complicated thing ever to come out of computing. It is the only decentralized standard to ever truly thrive, and due to that it has to be backwards-compatible with mainframes in universities from 1971.

But I don't want to talk about email, mainly because I got banned from email.

<img src="/images/email-is-hard/loops-ban.png" alt="Loops support conversation" class="half-width">

[Loops](https://loops.so) is a SaaS for email. They do product, transactional, and marketing emails and they are backed by [Y Combinator](https://en.wikipedia.org/wiki/Y_Combinator). They're great! But my website isn't exactly good for email reputation, so I got (respectfully) banned.

This meant I had to I move from Loops, to something else. That something else is Resend-powered solution with (mostly) custom branding, for free.

Here's the spec:

The solution should be free, I should not need to pay for a replacement to a free solution. The solution should run in the background, I should not need to think about it, it needs to run in the background, intelligently and without causing everything to explode if something goes wrong. The solution should replace Loops completely, I do not want to compromise due to this move, it should auto-publish new blog posts to email, it should use a simple HTML form, and it should have double opt-in[^1].

To do this I first had to find an email provider. I've used [Resend](https://resend.com) before with [Coolify](https://coolify.io) to send status emails, but never as a "customer-facing" system. 

Resend is very, very different from Loops. Instead of a pre-built solution, they are literally an Amazon SES wrapper with some basics. This means that for free you get:

- A 1000-person audience, with segments
- 3000 emails/month, 100/day
- Sceduled broadcasts to specific segments
- Unsubscribe pages
- full API access for all features

This is almost the perfect solution for me, I don't have to host a database, or suffer through any of the SMTP hell, but I control what is in the emails, I control when people are added to the audience, I control the entire flow.

## A free[^2] solution

To send emails, the first thing I need to do is get emails. Because I had decided that my website would have zero Javascript, this meant my only option was HTML forms. Resend does not support HTML forms, but they do have a very simple JSON API. To convert between the private API and tokens and the HTML form, I needed a translation layer.

[Cloudflare Workers](https://workers.cloudflare.com/) was the solution. They provide free compute (albeit a very small amount), in the form of a customized express server. I just setup a secret for the Resend API key, and it worked.

My architecture works like this:

<img src="/images/email-is-hard/cf-workers.svg" alt="Cloudflare Workers flowchart" class="half-width">

## Background Tasks

To make everything run in the background, any staic generation works through Hugo render hooks, anything related to the Worker just wakes on API call, and anything that is linked to git commits is a Github action triggered by a push. Phew, that was quick!

## A Complete Replacement

To replace Loops, my solution needs to both email people when a new blog post is deployed and it needs to have double opt-in.

To send out emails when a now blog post is posted, a Github Action follows this procedure:

<img src="/images/email-is-hard/github-action.svg" alt="GitHub Action flowchart" class="half-width">

To make double opt-in, my Cloudflare Worker sends out an email and stores thei data in a KV Store for 24 hours, if they click the link sent to their email, it adds them to the audience, otherwise it deletes their info after 24 hours. This makes sure that the worker is never under too much load, and that anything in it is ephemeral.

I am calling this solution [resender](https://github.com/dropalltables/resender), and I'm opensourcing it! If you want to use it just follow the instructions in the README, all you need is a Cloudflare and Resend account.

[^1]: Double opt-in is an email-marketing strategy where you send a transactional email to a subscriber to have them confirm their subscription, showing their email server that they really do want to receive your emails, while at the same time reducing your audience to true subscribers.

[^2]: Mostly free, it maxes out at 3000 emails/month, and 1000 subscribers, Cloudflare also has worker limits.