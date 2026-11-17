# Load on the Docker host with:
#   sudo apparmor_parser -r -W docker/apparmor.profile
# Explicit userns permission is needed on Ubuntu 24.04 and later. Docker's
# docker-default profile denies mounts, including nsjail's private mounts.
# The supervisor is non-root with no outer capabilities. These permissions
# therefore apply only to resources it owns in its nested user namespace.
#include <tunables/global>

profile next-site-nsjail flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>

  userns,
  file,
  network inet stream,
  network inet6 stream,
  network inet dgram,
  network inet6 dgram,
  network unix,
  capability,
  mount,
  umount,
  pivot_root,
  signal (send, receive) peer=next-site-nsjail,
  signal (receive) peer=unconfined,
  signal (receive) peer=runc,
  signal (receive) peer=docker-default,

  deny /sys/** wklx,
  deny /proc/sys/** wklx,
  deny /proc/sysrq-trigger rwklx,
  deny /proc/kcore rwklx,
  deny /proc/kmem rwklx,
  deny /proc/mem rwklx,
  deny /proc/kallsyms r,
}
