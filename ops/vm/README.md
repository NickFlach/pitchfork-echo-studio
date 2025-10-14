# Single-node VM Deployment (Docker Compose + systemd)

Prereqs:
- Ubuntu 22.04+ with Docker and Docker Compose Plugin
- `.env` placed in project root with strong secrets (see README.md)

Files:
- `pitchfork-compose.service`: systemd unit to run `docker compose up -d`

Install:
```bash
sudo cp pitchfork-compose.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable pitchfork-compose
sudo systemctl start pitchfork-compose
```

Security hardening (quick checklist):
- ufw allow 22/tcp, 8080/tcp, 3001/tcp; deny other inbound
- enable fail2ban (sshd)
- keep OS and Docker updated
- rotate secrets regularly

Logs & health:
```bash
# Compose logs
sudo journalctl -u pitchfork-compose -f
# API health
curl -s localhost:3001/ready | jq
# Frontend
curl -s localhost:8080 | head
```
