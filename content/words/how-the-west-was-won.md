+++
date = '2026-07-13T19:36:06-07:00'
draft = false
title = 'On Finding Vulnerabilities in the Kernel, and Automating it'
+++
tl;dr i built a filtering engine called patchless to find likely (patched but not in distros) vulnerabilities in the linux kernel git repository. https://patchless.natey.sh

---

wouldn't it be cool if there was something that had some knowledge of the heuristics of these commits, unrelated to content, specifically focusing on metadata, and could filter down 1.4 million commits in the kernel to ~40 thousand candidates, and then again down to ~5k likely and ~1k high-confidence vulnerabilities, *without using any large language models?* just plain regex, and some secret sauce ;) (more regex).

![The discovery UI for ](/images/how-the-west-was-won/hero.png)

here is an example of a vulnerability found by patchless https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=84a04eb5b210643bd67aab81ff805d32f62aa865

this is not a CVE yet, and will probably be medium to high. i did not find this vulnerability, and this post is not about that, the authors (as far as i know from the commit) are as listed

> author	Doruk Tan Ozturk <doruk@0sec.ai>	2026-05-26 20:37:26 +0200
> committer	Stefan Schmidt <stefan@datenfreihafen.org>	2026-06-19 22:43:34 +0200

i did not look through the code to find this vulnerability, or talk to anyone related to the kernel or 0sec.

i'm sure that what i'm doing here has been done before, but i haven't seen it online, or in a way that is easy to filter through and read.

for people who do not know how linux works, this is the gist of it: all distros of linux, such as [ubuntu](https://ubuntu.com/), [arch](https://archlinux.org/), [debian](https://www.debian.org/), [etc.](https://en.wikipedia.org/wiki/List_of_Linux_distributions) pull the core of their os, called the kernel, from [kernel.org](https://kernel.org). the main source for the kernel is hosted on [git.kernel.org](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git), the kernel's own platform, similar to github, but run by the [linux foundation](https://www.linuxfoundation.org/).

when someone wants to find a security vulnerability, the kernel is the best place to start. this kernel is in every single computer running linux (the vulnerability listed here is in a subsystem, meaning only devices with that subsystem are vulnerable, but the code itself is global), and because it is used by every distribution, it takes a while for changes to propagate from the kernel to the main distros. this period between the vulnerability, it being patched, and that patch being propagated to the main distros, and then released publicly is called the propagation delay.

so there is a small period in which a patch for a vulnerability is open for anyone to see, but not actually acknowledged, and not widely patched and implemented yet. i think that's pretty cool, but the signal to noise ratio for the kernel is so high that it would be a full time job reviewing the commits and thinking about if they are security-related. to make it harder, the kernel security team's policy is to treat vulnerabilities as normal bug fixes, making these commits hard to spot.

that's my project. go check it out!

https://patchless.natey.sh