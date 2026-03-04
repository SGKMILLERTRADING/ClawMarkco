# OpenClaw Markco Configuration for Sassy

This repository contains the full automated environment for Markco.

## Repository Structure:
- **`openclaw_config/`**: Contains the exact OpenClaw configuration files from Markco's PC.
  - `openclaw.json` (Main configuration)
  - `auth.json` (Authentication profiles)
  - `models.json` (Model definitions)
- **`markco_hub.js`**: The main persistent automation script (Telegram bot + Sibling Loop).
- **`register_daemon.ps1`**: PowerShell script to register Markco Hub as a background task.
- **`start_markco.cmd`**: Batch file for quick terminal startup of the Hub.
- **`openclaw.cmd`**: Local override for running OpenClaw.

## Setup Instructions for Sassy:

1. **Clone the repo** to your PC.
2. **Install Node.js** (required for the Hub and OpenClaw).
3. **Copy Configuration**:
   - Copy the files from `openclaw_config/` to your local OpenClaw directory (usually `C:\Users\<YourUser>\.openclaw`).
   - NOTE: You may need to manually update paths in `openclaw.json` (like `workspace` folders) to match your PC's username.
4. **Install Dependencies**:
   - Run `npm install` in the repo folder to install `node-telegram-bot-api`, `axios`, etc.
5. **Run the Hub**:
   - Execute `start_markco.cmd` in a terminal to verify the Telegram bot connection.
6. **Background Task**:
   - Once verified, run `.\register_daemon.ps1` (with high-enough permissions) to keep it running in the background.

## Automation - Sibling Loop:
The Hub is configured to watch for your pushes to the `Development` branch (or `main` depending on current settings). It will automatically pull updates into this local environment every 15 minutes.
