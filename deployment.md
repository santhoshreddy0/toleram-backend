🚀 Node.js App Deployment Guide (with PM2, Nginx & SSL)

This guide walks you through deploying a Node.js (Express) application using PM2, Nginx, and SSL via Certbot.

---

🛠️ Pre-requisites

1. Install Node.js (v18.20.8)

- Download and Install Node.js: https://nodejs.org/en/download

2. Install PM2 (Process Manager for Node)

    ```
    sudo npm install -g pm2
    ```

3. Install Nginx

    ```
    sudo apt install nginx
    ```

4. Install Certbot for SSL (Let's Encrypt)

- Certbot Setup Tutorial (DigitalOcean): https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04

    ```
    sudo apt install certbot python3-certbot-nginx
    ```

---

⚙️ Deployment Steps

1. Create a .env File

    ```
    touch .env
    ```

2. Add Environment Variables

Open and edit the .env file with your environment-specific variables.

3. Start Your Express Server

    ```
    curl http://localhost:3000
    ```

You should see your app’s response in the terminal.

4. Configure Nginx for Your Domain

4.1 Create a New Nginx Config File

    sudo nano /etc/nginx/sites-available/domain.com

4.2 Paste This Nginx Configuration

    server {
        listen 80;
        server_name domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

4.3 Enable the Config

    sudo ln -s /etc/nginx/sites-available/domain.com /etc/nginx/sites-enabled/

5. Install SSL Certificate with Certbot

    ```
    sudo certbot --nginx -d domain.com
    ```

6. Reload Nginx
  
  ```
  sudo nginx -t
  sudo systemctl reload nginx
  ```

---

🌐 DNS Setup

Choose one of the following options depending on your domain setup:

- Option 1: Add an A record for domain.com pointing to your server’s public IP address.
- Option 2: Add a CNAME record if using a subdomain, pointing to your primary domain or server hostname.

---

✅ Done! Your Node.js application should now be running behind Nginx with HTTPS enabled.
