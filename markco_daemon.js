const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_DIR = path.join(__dirname);
const BRANCH_TO_WATCH = 'Development';
const POLL_INTERVAL = 1000 * 60 * 15; // 15 minutes

console.log("[Markco's Daemon] Starting up the heartbeat... I'm online.");

function siblingSync() {
    console.log(`\n[Markco's Sibling Loop] Syncing with Sassy's ${BRANCH_TO_WATCH}...`);
    try {
        execSync(`git fetch origin`, { cwd: REPO_DIR, stdio: 'ignore' });
        const remoteBranches = execSync(`git branch -r`, { cwd: REPO_DIR, encoding: 'utf-8' });

        if (!remoteBranches.includes(`origin/${BRANCH_TO_WATCH}`)) {
            console.log(`   -> Still no ${BRANCH_TO_WATCH} branch from Sis. Waiting patiently.`);
            return;
        }

        let localCommit = '';
        try {
            localCommit = execSync(`git rev-parse ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();
        } catch (e) {
            console.log(`   -> Found it! Checking out ${BRANCH_TO_WATCH} locally...`);
            execSync(`git checkout -b ${BRANCH_TO_WATCH} origin/${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, stdio: 'ignore' });
            localCommit = execSync(`git rev-parse ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();
        }

        const remoteCommit = execSync(`git rev-parse origin/${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();

        if (localCommit !== remoteCommit) {
            console.log(`   -> [ALERT] New code push from Sassy. Pulling architecture...`);
            execSync(`git pull origin ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, stdio: 'ignore' });

            const bugsPath = path.join(REPO_DIR, 'BUGS.md');
            const alert = `\n- **Issue:** [Automated Watcher] Sassy dropped new code (${remoteCommit}).\n- **Severity:** [Pending Manual Audit] (Check Video Editor / Koin transfers)\n- **Found In:** [${BRANCH_TO_WATCH} branch]\n- **Description:** Markco pulled latest changes for processing.\n`;
            fs.appendFileSync(bugsPath, alert);
            console.log(`   -> Pulled safely. Log in BUGS.md updated!`);
        } else {
            console.log(`   -> Everything on ${BRANCH_TO_WATCH} is up to date.`);
        }
    } catch (e) {
        console.error(`   -> Sibling loop failed during fetch: ${e.message}`);
    }
}

function stevenDirective() {
    console.log(`\n[Steven's Directive] Running Google Drive scan for Dad's new notes...`);
    // Placeholder for actual gog tool integration.
    // In OpenClaw, gog skill handles Drive syncing, requiring proper OAUTH tokens.
    // We update PROJECT_STATUS.md when new text is found.
    const statusPath = path.join(REPO_DIR, 'PROJECT_STATUS.md');
    let statusText = fs.readFileSync(statusPath, 'utf-8');

    // Simulating token absence for now:
    console.log(`   -> OpenClaw requires the 'gog' skill to be fully authenticated. Standing by for OAUTH connection from Steven/Dashboard.`);
}

function heartBeat() {
    siblingSync();
    stevenDirective();
}

// Initial Run
heartBeat();

// Scheduling
setInterval(heartBeat, POLL_INTERVAL);
