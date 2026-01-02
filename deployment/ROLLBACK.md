# Rollback Instructions

If a deployment fails or introduces a critical bug, follow these steps to roll back to the previous version.

## Option 1: Revert via Git (Preferred)
1. Locally, revert the merge commit or bad commit on `main`.
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
2. The CI/CD pipeline will automatically build and deploy the reverted version.

## Option 2: Manual Rollback on Server (Emergency)
If the CI/CD pipeline is broken or too slow:

1. **SSH into the server**
   ```bash
   ssh user@your-server-ip
   cd ~/kisan-sarathi/deployment
   ```

2. **Check available images**
   ```bash
   docker images
   ```
   Find the image tag corresponding to the last stable deployment (images are tagged with sha commit hashes in the registry).

3. **Update .env or Export Tag**
   ```bash
   export DOCKER_IMAGE_NAME=ghcr.io/your-org/kisan-sarathi-backend:<previous-sha>
   ```

4. **Restart Services**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

5. **Verify**
   Check logs to ensure the old version is running correctly.
   ```bash
   docker-compose logs -f app
   ```
