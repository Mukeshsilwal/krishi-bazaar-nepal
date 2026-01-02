# Deployment Guide for Kisan Sarathi

## Prerequisites
- A server running Ubuntu 20.04+.
- Docker and Docker Compose installed on the server.
- A domain name pointing to the server's IP.
- Access to the GitHub repository.

## Initial Server Setup

1. **Install Docker & Docker Compose**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo usermod -aG docker $USER
   # Log out and log back in
   ```

2. **Prepare Directory**
   ```bash
   mkdir -p ~/kisan-sarathi/deployment
   mkdir -p ~/kisan-sarathi/deployment/nginx
   ```

3. **Copy Configuration Files**
   Copy the contents of the `deployment` folder from this repository to the server at `~/kisan-sarathi/deployment`.
   - `docker-compose.yml` -> `~/kisan-sarathi/deployment/docker-compose.yml`
   - `.env.example` -> `~/kisan-sarathi/deployment/.env`
   - `nginx/nginx.conf` -> `~/kisan-sarathi/deployment/nginx/nginx.conf`

4. **Configure Secrets**
   Edit the `.env` file on the server and populate all the secret values.
   ```bash
   nano ~/kisan-sarathi/deployment/.env
   ```
   **CRITICAL**: Do not commit the `.env` file to version control.

5. **Start the Application**
   ```bash
   cd ~/kisan-sarathi/deployment
   docker-compose up -d
   ```

## Automated Deployment (CI/CD)
The project includes a GitHub Actions workflow that automatically deploys changes when pushed to the `main` branch.

### Secrets Configuration in GitHub
Go to **Settings > Secrets and variables > Actions** in your GitHub repository and add:
- `SERVER_HOST`: IP address of your server.
- `SERVER_USER`: SSH username (e.g., `ubuntu`).
- `SERVER_SSH_KEY`: Private SSH key for accessing the server.

You DO NOT need to add `GITHUB_TOKEN`, it is automatic.

## HTTPS Setup
For SSL certificates, we recommend running Certbot manually once or adding a certbot container.
1. Install Certbot on host: `sudo apt install certbot`
2. Run: `sudo certbot certonly --standalone -d yourdomain.com`
3. Update `nginx/nginx.conf` to point to the generated certificates in `/etc/letsencrypt/live/...`.
4. Mount `/etc/letsencrypt` into the nginx container in `docker-compose.yml`.

## Monitoring
Check logs with:
```bash
docker-compose logs -f app
```
Check health:
```bash
docker-compose ps
```
