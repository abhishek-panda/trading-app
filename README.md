# multi-app
This is my multiapp repo hosted on abhishek-panda.in



## Linode Machine Setup with Cloudflare
A. https://www.linode.com/docs/products/compute/compute-instances/guides/set-up-and-secure/#configure-a-custom-hostname
  1. apt update && apt upgrade
  2. timedatectl set-timezone 'Asia/Kolkata'
  3. hostnamectl set-hostname <hostname>
  4. select-editor
          
     I use vi editor
  
  5. vi /etc/hosts

    Add IPv4 and IPv6
    <ipv4> <hostname>.<domain-name> <hostname>
    <ipv6> <hostname>.<domain-name> <hostname>

## Cloudflare + Ngnix setup on linode
  
  1. apt-get update
  2. apt-get install nginx

Detailed Docs:

    https://www.linode.com/docs/guides/how-to-install-and-use-nginx-on-ubuntu-20-04/
    https://www.linode.com/docs/guides/getting-started-with-nginx-part-1-installation-and-basic-setup/
    https://www.linode.com/docs/guides/how-to-set-up-cloudflare-with-linode/
      
Quick How to docs
 
     https://tarunkr.medium.com/how-to-setup-ssl-tls-for-your-domain-for-free-cloudflare-and-nginx-28ca308b895b  

Redirect to domain when someone hits IP. https://www.youtube.com/watch?v=uVIxeCLBEgo&t=154s

## Install NodeJS
1. curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
2. apt update -y
3. apt install nodejs -y

Check npm and node version
node -v
npm -v

https://www.vultr.com/docs/how-to-install-node-js--npm-on-debian-11/

### Seting MySQL on Debian 11
1. Setup Initialization
    apt update
    apt upgrade
    apt install wget
2. Install MySQL
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb
    apt install ./mysql-apt-config_0.8.22-1_all.deb
    apt update
    apt install mysql-server
    service mysql status
3. Secure MySQL
    mysql_secure_installation

4. Check mysql login
    mysql -u root -p

https://www.cloudbooklet.com/how-to-install-mysql-on-debian-11/
https://www.linode.com/docs/guides/installing-and-configuring-mysql-on-ubuntu-2004/



TODOS:

1. Sanitize all incoming inputs
2. Record those inputs 
3. Create a seperate log file for invalid requests.




Removing MySQL

1. service mysql stop
2. apt-get purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-*
3. rm -rf /etc/mysql /var/lib/mysql
4. apt autoremove
5. apt autoclean


### Check running node process

ps aux | grep node



### Block access to backend services

iptables -F
iptables -P INPUT DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables-save > /etc/iptables/rules.v4
iptables-restore < /etc/iptables/rules.v4