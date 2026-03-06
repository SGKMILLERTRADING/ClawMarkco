# Zion-Link Migration Protocol (Next PC Setup)

This guide contains the procedure for deploying Markco's Central Hub onto a brand new Windows PC. 

Markco's previous note stated:
> *NOTE: You may need to manually update paths in `openclaw.json` (like `workspace` folders) to match your PC's username.*

We have automated this process. You no longer need to edit JSON files manually.

## 1. Automated Setup
On the new PC, simply run the setup script:
```powershell
.\setup_next_pc.ps1
```

**What it does:**
- Detects your new Windows Username automatically.
- Re-writes `openclaw.json` so the `workspace` paths map correctly to the new PC.
- Copies the `openclaw_config` files into your `C:\Users\<NewUser>\.openclaw` directory.
- Runs `npm install` to grab all bot dependencies.

## 2. Environment Variables (.env)
Since this is going on a new machine, your Telegram and AI tokens shouldn't be hardcoded into the javascript files.

Create a `.env` file in the main folder with these values:
```env
TG_TOKEN=8652394835:AAG4K5PE4FlXM5jYo5tUxpL3EQjmv2hO1xI
OPENCLAW_KEY=722ef5620a5541fdd8e43d0485b994b65b1a1f610bbf9572
```
*Note: `.env` is already included in `.gitignore` to keep it safe.*

## 3. Register Background Daemon
Once everything is configured and tested, you can turn Markco Hub back into a persistent background shadow by running:
```powershell
.\register_daemon.ps1
```
