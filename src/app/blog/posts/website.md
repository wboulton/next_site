# My Website

I have spent a lot of time trying to figure out the best way to develop, structure, and host my website since I started making it. In this post I just want to talk about a bunch of the things I tried and decided against before falling on my current setup. In the end I will summarize my setup for developing and hosting this website.

## Web stack

The first version of my website was a simple single-page Vite setup. Vite was easy to develop with and pretty convenient, so I thought it would be a good option for my first attempt at making a website. I definitely learned a lot from this version of the website, mostly just involving writing JS and React front ends, which I had 0 experience with prior to starting the project. I looked back at the code for the Vite website recently and the setup and code is actually surprisingly similar to what I have today. However, I think this version of the website ultimately ended up failing because I overcomplicated the writeup rendering and lacked the experience to make it professional and easy to write and interact with.

The next version of the site was actually my current version (don't worry, I still have two more failed websites to go over). I decided to start using Next.js after a recommendation from a friend (who also happened to write the b01lersCTF website) and eventually ended up writing the first version of this website. I really enjoyed using Next and their documentation is really well written, making it easy to learn, but I ended up filing it away because I struggled to get the front end to look good.

Now marks my journey of trying to make a visually appealing. I mostly figured out how I wanted to render my writeups, blog posts, and other pages from the first two attempts, but I really struggled to get a front end that I was happy with. The first change I tried was Jekyll, which was fine but I just didn't really enjoy using it, and in the end this project was for me to enjoy learning some basic web development, so I quickly discarded it. The next change I tried was using a Next Tailwind template. These were certainly a lot better looking than anything I had made prior. I found a pretty decent template that needed some changes to better fit my style and started fixing it up. Around the 60% completion mark, I started to get really busy with school and stopped working on the project, forgetting about it entirely.

Months later, I was in a quantum computing class at Purdue and the professor had a really nice course website. Conveniently, the front end of this website was not very structurally different from what I had in my original Next.js website. Seeing an opportunity, I took a single screenshot of his website and fed it to Claude Opus and told it to mimic the style on my website, and here we are. So I guess I owe a thank you to Dr. Hood at Purdue University (and possibly Anthropic?). To this day I am still very impressed that Opus was able to one-shot the front end (mostly).

## Hosting infrastructure

I picked up a Supermicro server from the Purdue University surplus store last summer before RAM prices skyrocketed.

![alt text](IMG_8544.jpg)

At the time my whole setup (including server rack, hard drives, extra DDR4 ECC RAM, etc.) cost only about $300. With the increase in RAM prices, the RAM alone is worth more than double that. My goal has been to run my website out of this server as conveniently as possible. My server runs proxmox, so I have a virtual machine that builds and hosts my app for production (I will talk more about the building in the next section).

My problem has always been trying to expose this website to the internet. I tried a couple of tunnels to manage this. My server is connected to my other devices through Tailscale, so naturally the first tunnel I tried was the built-in Tailscale tunnel. This tunnel worked fine; I was able to see and use the website as expected from devices not on my tailnet. However, I wasn't able to properly use my domain. While my website was using this tunnel, I just had GoDaddy redirect the domain to my Tailscale tunnel with a URL like
`https://williamboultondotcom.tailad56e4.ts.net/`.
I wasn't happy with this, so I decided to switch to using a Cloudflare tunnel. The Cloudflare tunnel allowed me to change my DNS server and natively correct this URL problem. Using Cloudflare also let me create a custom email with my domain that I use for my contact in the [about](https://williamboulton.com/About) page.

## Development infrastructure

I am most happy with how the development infrastructure turned out. It is pretty simple, but it makes writing and posting blog posts and writeups super easy. It also makes all quick changes to the website really easy to push to production.

I have a personal Gitea instance running in another virtual machine on my server connected to my tailnet (at some point I will write a post explaining my whole server setup). This Gitea instance is actually the main host of the website's code; it is mirrored on GitHub so others can see it without me having to publicize my Gitea. The convenient thing about this is I get more flexibility with git actions, which I use to build and bring up my website on the website VM. I have a push action that builds and deploys my website:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_USER: ${{ secrets.SSH_ROOT }}
          SSH_KEY:  ${{ secrets.SSH_KEY }}
        run: |
          set -e
          mkdir -p ~/.ssh
          echo "$SSH_KEY" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan "$SSH_HOST" >> ~/.ssh/known_hosts 2>/dev/null

          ssh -i ~/.ssh/deploy_key "$SSH_USER@$SSH_HOST" '
            set -ex
            cd /home/cyberg/next_site
            git fetch origin
            git reset --hard origin/main
            git log -1 --oneline

            docker build -t next-site:new .

            docker rm -f next-site-new || true
            docker run -d \
              --name next-site-new \
              -p 3001:3000 \
              next-site:new

            for i in {1..30}; do
              if curl -fs http://localhost:3001 > /dev/null; then
                echo "New container is healthy"
                break
              fi
              if [ $i -eq 30 ]; then
                echo "New container failed health check"
                docker logs next-site-new
                docker rm -f next-site-new
                exit 1
              fi
              sleep 1
            done

            docker rm -f next-site-new
            docker rm -f next-site || true
            docker tag next-site:new next-site:latest
            docker run -d \
              --name next-site \
              --restart unless-stopped \
              -p 3000:3000 \
              next-site:latest

            echo "==DONE=="
          '
```

This action uses SSH to connect to my website VM, pull the updated code, build it in Docker, then run the website in a Docker container. This means to update my website all I have to do is push the changes and in about 50 seconds the production version of my website will be updated.

## Summary of my tech stack

My website is built on Next.js with fully custom styling and CSS (I dropped the Tailwind templates that I used previously). I use dynamic routing for these blog posts similar to the examples in the [Next documentation](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes). The writeups do not use dynamic routing at the moment because I wrote them before I learned how to use Next.js dynamic routes, but I will probably change that in the future. The app gets automatically built and run from a git action started by my Gitea instance, meaning I never have to manually SSH into my host VM and build and start the app. The production app on the host VM is exposed using a Cloudflare tunnel which also handles my custom email address.

All of the code for this website can be seen on my [GitHub](https://github.com/wboulton/next_site).

### Future plans

Eventually, I need to add a light mode. It took me a really long time to create a design that I was happy with, so I suspect that the light mode will not be done for a while. I also want to change my writeup rendering to use dynamic routing like the blog posts. This should be an easy fix, but since I likely won't be competing in any CTFs this summer I probably won't need it for a while. Finally, I have a small issue with my git actions. Currently, whenever I push the code it gets updated on production, which is inconvenient because I cannot push without updating the website itself. I want to look into making Gitea workflows that are triggered by other actions like creating a new tag. That way I would be able to push freely and when a feature or post is ready I can tag the code and the website will get updated.