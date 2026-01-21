+++
title = "I'm Sorry Dave, I'm Afraid I Can't See That"
slug = "feedback-loops"
date = "2026-01-21T09:59:37-08:00"
description = "A look at why vibe-coding in the traditional sense doesn't work, and a (known) solution to it."
draft = "true"
tags = ["amp","email","programming","web","ai","claude","feedbackloop"]
+++

I've been trying out [Amp](https://ampcode.com) for the past few weeks. It's by far the best agent I've ever used, and the free daily credits are great. And there is a reason for that.

## Feedback Loops

[Dictionary.com](https://www.dictionary.com/browse/feedback-loop) defines feedback loop as "The path by which some of the output of a circuit, system, or device is returned to the input."

If you've ever worked at a tech company, you are already very familiar with this. Your team deploys a feature, a customer finds a bug, you fix the bug, rinse and repeat. Its familiar because it works, and it works for agents too. The only difference is that AI doesn't have hands, or eyes, or the tools to use a computer efficiently to test out changes.

<img src="/images/feedback-loops/ai-view.png" alt="Your computer from the view of an AI agent: file contents, user messages, MCPs and other tools, and a shell." class="half-width">

Nowhere in there is a "video" input (ignoring Gemini...), or a "browser" input, or a "random-undocumented-internal-tool-api" input. And this is the core problem with the traditional approach to vibe-coding. Where you tell it to "make no mistakes" and just let it run. AI. Needs. Feedback loops. It is an inherent aspect of agents. Their entire approach is a while-true loop, so it makes perfect sense to provide feedback in the same way. Without it, the agent cannot know if the code works, the most it can see a "code compiled without errors" in the shell.

To prevent slop, provide feedback. This means giving the agent access to a [browser](https://agent-browser.dev/), or that [internal tool](https://modelcontextprotocol.io/docs/develop/build-server). The more tools you can give the agent to let it check its own work, or do better work, the better the output will be, and the less you will have to do.

This is why a ralph-loop works, this is why Claude Code went viral, and this is why Amp works so well.

## Implementation

To use Amp as an example, their implementation of feedback loops is twofold.

1. They give the agent access to tool like the Oracle[^1], and the Librarian[^2], to help with planning, and inital research, to give the agent feedback on its code before it even executes

2. They implement tooling such as browser-use and linting, to let the agent debug by itself if something worked.

This approach has been working, and you can see a clear difference between [shipping the pipeline to build your pipeline](https://www.linkedin.com/posts/prasadpilla_we-shipped-50-more-this-week-the-multi-agent-activity-7419600591015895040-EhZa), and [actually building useful tools](https://ampcode.com/threads/T-e4cc70f0-d222-4c40-a1e7-745025e3dc9c).

Take for example, this interaction between a user and an agent.

```
User:
    Make me 3D game with three.js.
Agent:
    <does some work>
    <uses shell tools to lint>
    <cleans up code with shell tools>
    Done!
1m 47s
User:
    This does not work, it shows a blank page in the browser.
Agent: Let's debug this...
    <runs commands>
    <tries to get the user to describe whats happening>
    ...
    <still doesn't work>
```
Hundreds of thousands of tokens are wasted, and the agent still cannot figure out what is happening.

Compare that to this interaction:

```
User:
    Make me 3D game with three.js.
Agent:
    <does some work>
    <uses shell tools to lint>
    <cleans up code with shell tools>
    Now let's test this
    <uses browser-use to test the code>
    <code errors>
    Hmm, let's check the console
    <finds the source of the error>'
    <fixes error>
    Let's make sure this doesn't happen again
    <improves code further>
    Let's check again
    <code works>
    Done!
5m 32s
User:
    It works, now let's...
```

Not only did the agent take more time and give a correct output, it also improved the code further, and without any user interaction, saving context and tokens.

[^1]: The [Oracle](https://ampcode.com/news/oracle) is an Amp-specific tool that gives the agent access to a powerful deep-thinking subagent to make plans and debug, as of now the model powering it is GPT 5.2.
[^2]: The [Librarian](https://ampcode.com/news/librarian) is another Amp-specific tool that lets a subagent, in this case Sonnet 4.5, have access to a Github APi, and unlimited web-search tools, to find direct code examples online, for libraries, previously found solutions, and more.