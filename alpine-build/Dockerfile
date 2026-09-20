FROM docker.io/i386/alpine:3.21.0

ARG USERNAME=user
ARG USERPASS=password

ENV KERNEL=virt
ENV ADDPKGS="nodejs python3 wget curl vim build-base nethack gpg"

RUN apk add --no-cache openrc alpine-base agetty alpine-conf linux-$KERNEL linux-firmware-none $ADDPKGS
RUN sed -i 's/getty 38400 tty1/agetty --autologin root tty1 linux/' /etc/inittab
RUN echo 'ttyS0::respawn:/sbin/agetty --autologin root -s ttyS0 115200 vt100' >> /etc/inittab
RUN echo "root:" | chpasswd

RUN setup-hostname revan


# Adding networking.sh script
# RUN echo -e "rmmod ne2k-pci && modprobe ne2k-pci\nrmmod virtio-net && modprobe virtio-net\nhwclock -s\nsetup-interfaces -a -r" > /root/networking.sh && chmod +x /root/networking.sh

RUN echo 'console.log("Hello, world!");' > /root/hello.js

# https://wiki.alpinelinux.org/wiki/Alpine_Linux_in_a_chroot#Preparing_init_services
RUN for i in devfs dmesg mdev hwdrivers; do rc-update add $i sysinit; done
RUN for i in hwclock modules sysctl hostname syslog bootmisc; do rc-update add $i boot; done
RUN rc-update add killprocs shutdown

# Generate initramfs with 9p modules
RUN mkinitfs -F "base virtio 9p" $(cat /usr/share/kernel/$KERNEL/kernel.release)
RUN rc-update add hostname boot
RUN mkdir -p /etc/local.d && \
    printf '#!/bin/sh\nhostname revan\n' > /etc/local.d/hostname.start && \
    chmod +x /etc/local.d/hostname.start && \
    rc-update add local default

# create the user with bash as login shell, and add them to wheel
RUN adduser -D -s /bin/sh "$USERNAME" && \
    echo "$USERNAME:$USERPASS" | chpasswd && \
    adduser "$USERNAME" wheel

# passwordless sudo for the wheel group
RUN apk add --no-cache sudo && \
    echo '%wheel ALL=(ALL:ALL) NOPASSWD: ALL' > /etc/sudoers.d/wheel && \
    chmod 0440 /etc/sudoers.d/wheel

# autologin as the user on tty1 instead of root
RUN sed -i "s/--autologin root/--autologin $USERNAME/" /etc/inittab
COPY motd /etc/motd
COPY files/ /home/user/
RUN chown user:user -R /home/user
RUN echo 'export PATH="/home/user/.bin:$PATH"' >> /home/user/.profile && chown user:user /home/user/.profile
