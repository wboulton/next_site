# Server Infrastructure
Last summer I went to the Purdue University surplus store and picked up a used Supermicro 5018R-MR server for $50. I didn't entirely know what I wanted to do with it when I bought it, but eventually this turned into the most interesting personal project I have worked on for the past year. The server has come a long way from when I bought it — and I still have more I want to do. I now use my server very frequently and it has become an integral part of my setup, so I want to describe and diagram my server infratstructure. 

## Hardware
The server came with an old Intel Xeon with 4 cores, 64 GB of DDR4 ECC ram, and no drives. Since purchasing it, I replaced the cpu with an Intel Xeon E5-2698 v3 with 16 cores, enough to run all of my persistant applications. I also purchased an additional 64 GB of DDR4 ECC ram, which is currently in the b01lers club server instead of my personal server. I was lucky enought to get this right before ram prices skyrocketed, so at the time of purchase this ram cost me $50 instead of $300 today. I bought a 4 TB SATA HDD to use as my main storage, and later bought two m2 to 3.5" adapters to use two old 1 TB m2 SSDs I had laying around as an additional zfs pool.

## Proxmox
I originally planned on just installing ubuntu server and running that "bare metal" instead of using a hypervisor, but a friend who has his own personal server setup recommended I use proxmox. I ultimately decided to go with proxmox because I was inheriting the b01lers club server, which runs proxmox, and I saw having my own server with the same hypervisor setup as a good learning opportunity for when I am managing the club's infrastructure. I run a super old and outdated version of proxmox (6.4-4). I am a little unsure as to how I even managed to get such an old version, but it isn't causing any problems for me so I don't have much of a reason to update. 

My proxmox setup is quite simple, I only use the root user and I have 19 VMs all with different purposes. I only use one network device plugged into ethernet and a single network bridge from that device to all of my VMs. All system and network settings are the default.

### Persistant VMs
Of my 19 VMs, only 3 of them are meant to run at all times. These three are in the diagram at the end of this blog post, and include my website (the VM that builds and hosts the production version of this website), my gitea instance, and my minecraft server. These three VMs are set to start at boot and have their respective processes or containers started when the VM boots up.

The website VM uses two docker containers which handle hosting and updating my website. The main docker conatiner which hosts my website is a basic next.js deployment conatiner based on [this example](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile). The other container is the default gitea runner container and handles my git action to rebuild and redeploy when an update is pushed to my gitea repo.

The other two VMs run their processes through tmux, which gets started with a systemctl script on boot.

I have a fourth persistant VM, but it serves only as a shared drive for all of my devices which I primarily use to back up my laptop.

### Other VMs
I have many other VMs that I use for specific purposes, but they all mostly give me the advantage of storage for large codebases or datasets that I cannot fit on my laptop (like one VM that holds some large sqlite databases). I also have a couple of VMs that I use for processes that need a lot of ram that I can't accommodate on my laptop.

## Drives
My drive setup is not super clean or professional, but it serves my purposes so I am content with it. 

I use my large HDD for most VMs, this means all of my VMs with large databases or codebases go on the 4 TB drive to save space on my SSD pool. Since I have the redundancy of mirrored drives in my SSD zfs pool, I use that pool for virtual machines that store important data. At the moment, the only two VMs on the SSD pool are my gitea and backup servers. 

## Networking
My networking is done almost entirely through tailscale. When setting up my server I needed to decide between using tailscale to connect to root in proxmox or OPNsense then do networking from there to connect to each VM (this is essentially how the b01lers server works) or connect tailscale to each individual VM. When doing some reasearch on the topic, I found blog posts advocating for both options, but the second option is much easier to implement and lets me use Tailscale ACLs so I went this route.

Each virtual machine is connected to tailscale independently (along with proxmox root) and I tag the persistant virtual machines to limit their access rules through tailscale ACL. I use tailscale access controls to limit the ports that my gitea VM can communicate through to only what I expect from gitea. I also use them to limit the website VM to only communicate to gitea, and no other machines on my tailnet. 

Another benefit of tailscale is using taildrive to expose shared drives. I use this for the backup VM that I use to backup my laptop and archive files. However, I get the most use out of taildrives by using taildrive to expose the downloads folder on my laptop. This lets me import files that I download on my laptop to my tablet which I use to take notes. This is probably the most useful part of my tailscale setup in my school work at Purdue.

I also use tailscale as a vpn at times, which is easy to do by simply uping one of my virtual machines or my proxmox root as an exit node.

Finally, I have two tunnels that I use to let other access my minecraft server and website. My cloudflare tunnel exposes this website to anyone through my domain. I also use a free playit.gg tunnel to expose my minecraft server to my friends. 

## Diagram & Summary
![alt text](infra.jpg)

My server runs proxmox with tailscale on all my devices and VMs. I use ACLs to limit access of persistant VMs and taildrives to let me backup and use data from all of my machines. I use two tunnels to connect others to my website and minecraft server. This diagram gives a rough overview of this networking. 

Finally, I have a gitea action that builds and replaces my website docker container whenever I update the website. This is included in the diagram above and described in my previous blog post. 

## Future Plans
Soon I plan on changing the persistant VMs that use tmux (my minecraft server and gitea instance) to use docker containers instead. This makes a much cleaner solution than using tmux and a systemctl startup command, and I am more accustomed to doing this since I made my website deployment.

I also want to change my access rules for most VMs and devices on my network as to only allow intended interactions between my devices.

Finally, every time I update my website it has about 3 seconds of downtime. This is not really a problem for my personal website, but it would be an interesting project to fix this using traefik or something similar.