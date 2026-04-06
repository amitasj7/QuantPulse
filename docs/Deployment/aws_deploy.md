# 🚀 AWS Free Tier Deployment Guide — QuantPulse

This guide will walk you through deploying QuantPulse on **AWS (Amazon Web Services)** using the **Free Tier** eligible services. We will use a single **EC2 Instance** to run your entire Docker stack, mimicking the architecture we prepared for Oracle Cloud.

---

## 🛠️ Phase 1: AWS Account & Security Setup

### 1.1 Create an AWS Account
- Go to [aws.amazon.com](https://aws.amazon.com/) and sign up.
- You will need a Credit/Debit card for verification, but you won't be charged if you stay within free tier limits.

### 1.2 Create an IAM User (Optional but Recommended)
- Instead of using the "Root" account for everything, create an IAM user with `AdministratorAccess` and enable MFA.

### 1.3 Create a Key Pair
- Go to **EC2 Dashboard** > **Network & Security** > **Key Pairs**.
- Click **Create key pair**.
- Name it: `quantpulse-key`.
- Key pair type: `RSA`.
- Private key file format: `.pem`.
- **IMPORTANT**: Save this file in a safe place. You cannot download it again.

---

## 🏗️ Phase 2: Provisioning the EC2 VM

### 2.1 Launch Instance
- Go to **EC2 Dashboard** > **Instances** > **Launch instances**.
- **Name**: `QuantPulse-Production`.
- **OS Image (AMI)**: `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type` (Ensure it says "Free tier eligible").
- **Instance Type**: `t2.micro` or `t3.micro` (depending on your region's free tier).
- **Key pair**: Select the `quantpulse-key` you created.

### 2.2 Configure Security Group (Firewall)
- Under **Network settings**, click **Edit**.
- **Security group name**: `quantpulse-sg`.
- **Security group rules**:
  1. **SSH**: Port 22 | Source: `My IP` (For secure access).
  2. **HTTP**: Port 80 | Source: `Anywhere (0.0.0.0/0)`.
  3. **HTTPS**: Port 443 | Source: `Anywhere (0.0.0.0/0)`.
- Click **Launch instance**.

---

## 🛡️ Phase 3: Server Preparation

### 3.1 Connect to your VM
- Open your terminal and run:
  ```bash
  chmod 400 quantpulse-key.pem
  ssh -i "quantpulse-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
  ```

### 3.2 Install Docker & Docker Compose
Run these commands on the EC2 instance:
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get install -y docker-compose-plugin
```

---

## 🚢 Phase 4: Deploying QuantPulse

### 4.1 Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/QuantPulse.git
cd QuantPulse
```

### 4.2 Configure Environment Variables
Create your production `.env` file:
```bash
nano .env
```
Copy your variables from `.env.example` and fill in your **Production Secrets** (strong passwords for DB/Redis).

### 4.3 Launch the Stack
```bash
# Build and run the production stack
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.prod.yml up --build -d
```

---

## 🔒 Phase 5: Domain & SSL (Let's Encrypt)

### 5.1 Point DNS
- Go to your domain registrar (GoDaddy, Namecheap, Route 53, etc.).
- Add an **A Record** pointing `@` to your **EC2 Public IP**.

### 5.2 Install Certbot
On the EC2 instance, run:
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 5.3 Generate SSL
Since Nginx is running in a container, you should temporarily stop the Nginx container to let Certbot use port 80, or use the webroot method. 
Recommended: Generate the cert on the **host** and mount it into Docker.

---

## 💰 AWS Free Tier Tips for QuantPulse

- **EBS Storage**: You get 30GB of SSD storage for free. Don't go over this across all your instances.
- **Data Transfer**: 100GB of outgoing data per month is free. Market data streaming can consume this, so monitor your usage.
- **Elastic IP**: If you stop your instance, the IP might change. Use an **Elastic IP** (free as long as it's attached to a running instance).

---

## 🚨 Critical Note for t2.micro
The `t2.micro` instance has only **1GB of RAM**. 
Next.js builds and Nest.js with TimescaleDB can be heavy.
- **Optimization**: I have already optimized your Next.js Dockerfile to use the `standalone` build, which is essential for this low-memory environment.
- **Swap**: You **MUST** enable a Swap File on your EC2 instance to prevent crashes during builds:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
