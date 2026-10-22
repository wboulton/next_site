# My Trail of Bits Internship

I was very lucky to work at Trail of Bits this summer as an intern in the research and engineering team. I also recieved an offer to return in July after I graduate this Spring. I am super excited to come back and work on the top level security research with the Trail of Bits team; I could not have hoped to land in a better place after graduating.

This post is a little description of what I did over the summer, formatted mostly as if it were posted on the trail of bits blog. Enjoy!

# Streamlining agent development with Offsec Bench

As many companies become more AI native ([including Trail of Bits](https://blog.trailofbits.com/2026/03/31/how-we-made-trail-of-bits-ai-native-so-far/)) we have seen an increasing demand for high-quality, tested, task-specific agents. At Trail of Bits, we have many bug-finding and exploitation agents that we use on all of our work from audits to [Patch the Planet](https://blog.trailofbits.com/2026/06/22/introducing-patch-the-planet/), and I don't see the importance of agent development diminishing any time soon.

Despite our engineers' experience and skill in LLM-augmented bug finding (as evidenced by [Patch the Planet](https://blog.trailofbits.com/2026/07/28/how-we-use-goal-to-find-bugs-in-patch-the-planet/), [AIxCC](https://blog.trailofbits.com/2025/08/09/trail-of-bits-buttercup-wins-2nd-place-in-aixcc-challenge/), etc.) we have an issue with the way many of our agents are developed and used. Most of our engineers use anecdotal or personal experience to develop their agents/harnesses, decide which models to use, or even select reasoning levels. Ideally, we would be able to measure and compare these agents efficiently to show what works and what doesn't, and to drive rapid improvement of already productive agentic systems.

That's why I spent the summer developing [Offsec Bench](), a tool designed to enable rapid testing, debugging, and optimization of Trail of Bits agents and harnesses.

## Key Features

A multitude of benchmarking frameworks already exist for measuring agent capabilities, so there is no value in just creating something to run our agents through benchmarks. This is why we decided to focus on two key problems, task generation and agent debugging.

### Task Generation

To adequately measure task-specific agents, we need task-specific benchmarks. For general tasks like exploitation or bug finding (on smaller codebases) you can probably find existing benchmarks that fit your task. For some specific tasks it is often difficult to find recent, high-quality benchmarks that fit your use case.

Offsec Bench addresses this through both benchmark structure and task-generation tools. We use [Harbor](https://www.harborframework.com/) tasks in Offsec Bench because of their strict and modular structure. This makes it easy to create skills that can convert provided targets into high-quality benchmarks that follow best practices to prevent common benchmark flaws. We include multiple skills to create the challenge types we cared about during my internship.

### Agent Debugging and Optimization

#### Debugging

Now that we have representative tasks, we can start to implement and use a multitude of different optimization and debugging techniques to accelerate the development of agents. At the center of this is an [Inspect Scout](https://meridianlabs-ai.github.io/inspect_scout/) runner that provides options for optimizers and developers to selectively and automatically parse traces and condense them into information-dense, usable reports. This spares developers from hours of reading traces (which in our case contained tens of millions of tokens) in favor of a dense report with trace-supported references.

This runner is then repurposed for each optimizer included in the full Offsec Bench suite as a means of targeted trace ingestion -- allowing us to keep a report of each optimizer evaluation for the proposer to feed off of while modifying the agent, prompt, tools, or knowledge base.

#### Optimizers

More optimizers may be added in the future, but the current suite includes: a [GEPA](https://arxiv.org/abs/2507.19457)-based prompt and skill optimizer; a [MetaHarness](https://arxiv.org/abs/2603.28052)-based harness optimizer; an [EvoSOP](https://arxiv.org/abs/2607.07321)-based standard operating procedure/atomic tool generator; and a knowledge base generator.

The first two are classic iterative optimizers (run an evaluation set while proposing changes until something does better on the holdout test), while the latter two are meant to be used more continuously. Since EvoSOP and the knowledge base generate tools and resources that would either overfit to benchmarks quickly or apply to too few tasks to show measurable improvement, these tools should be used continuously on optimized agents as you convert new tasks to benchmarks. It would also be worth adding these tools to the agent itself, so it can learn from runs even outside of our benchmarking environment.

## Future Work

I have started creating some automated task-generation skills and workflows that let engineers convert known Linux CVEs or Trail of Bits [Patch the Planet](https://blog.trailofbits.com/2026/06/22/introducing-patch-the-planet/) findings into benchmarks. However, a more robust automated pipeline that converts applicable bugs to benchmarks would be a nice way to have a constantly growing, recent dataset.