const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_DIR = path.join(__dirname);
const BRANCH_TO_WATCH = 'Development';

console.log(`[Markco's Sibling Loop] Waking up. Checking Sassy's ${BRANCH_TO_WATCH} branch for changes...`);

try {
    // Navigate and fetch remote updates quietly
    execSync(`git fetch origin`, { cwd: REPO_DIR, stdio: 'ignore' });

    // Check if Development exists remotely
    const remoteBranches = execSync(`git branch -r`, { cwd: REPO_DIR, encoding: 'utf-8' });
    if (!remoteBranches.includes(`origin/${BRANCH_TO_WATCH}`)) {
        console.log(`[Markco's Sibling Loop] Sassy hasn't pushed the ${BRANCH_TO_WATCH} branch yet. Standing by.`);
        process.exit(0);
    }

    // Compare local refs to remote refs for the Development branch
    let localCommit = '';
    try {
        localCommit = execSync(`git rev-parse ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();
    } catch (e) {
        // Local branch might not exist yet
        console.log(`[Markco's Sibling Loop] Initializing local tracking for ${BRANCH_TO_WATCH}...`);
        execSync(`git checkout -b ${BRANCH_TO_WATCH} origin/${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, stdio: 'ignore' });
        localCommit = execSync(`git rev-parse ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();
    }

    const remoteCommit = execSync(`git rev-parse origin/${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();

    if (localCommit !== remoteCommit) {
        console.log(`[Markco's Sibling Loop] ALERT: Sassy pushed new code to ${BRANCH_TO_WATCH}! Pulling to local test environment...`);
        execSync(`git pull origin ${BRANCH_TO_WATCH}`, { cwd: REPO_DIR, stdio: 'ignore' });

        // Log to BUGS.md
        const bugsPath = path.join(REPO_DIR, 'BUGS.md');
        const timestamp = new Date().toISOString();
        const testReport = `\n- **Issue:** [Automated Test Protocol] Sassy submitted new code (${remoteCommit}).\n- **Severity:** [Pending Audit]\n- **Found In:** [${BRANCH_TO_WATCH}]\n- **Description:** Markco's Sibling Loop has automatically pulled the latest code from Sassy for validation.\n- **Resolution:** Awaiting full logic error sweep on newest architecture.\n`;

        fs.appendFileSync(bugsPath, testReport);
        console.log(`[Markco's Sibling Loop] New code safely pulled. BUGS.md updated. Ready for Steven's or Markco's manual audit.`);

        // Return to main branch if needed or stay on development to let Markco test
        // execSync(`git checkout main`, { cwd: REPO_DIR, stdio: 'ignore' });
    } else {
        console.log(`[Markco's Sibling Loop] No new commits from Sassy on ${BRANCH_TO_WATCH}. Everything is up to date.`);
    }

} catch (error) {
    console.error(`[Markco's Sibling Loop] Error during execution:`, error.message);
}
