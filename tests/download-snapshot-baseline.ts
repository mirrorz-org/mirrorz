import { Octokit } from "octokit";
import fs from 'fs';

(async () => {
    const octokit = new Octokit({
        auth: process.env['GITHUB_TOKEN'],
    });
    const repo = { owner: 'tuna', repo: 'mirrorz' };
    const workflowRuns = await octokit.rest.actions.listWorkflowRunsForRepo({
        ...repo,
        branch: 'master',
        per_page: 1,
        status: 'success',
    });
    const latestRun = workflowRuns.data.workflow_runs[0];
    const artifacts = await octokit.rest.actions.listWorkflowRunArtifacts({
        ...repo,
        run_id: latestRun.id
    });
    const snapshotBaseline = artifacts.data.artifacts.find(artifact => artifact.name == 'screenshot-baseline');
    if (snapshotBaseline) {
        const artifact = await octokit.rest.actions.downloadArtifact({
            ...repo,
            artifact_id: snapshotBaseline.id,
            archive_format: 'zip'
        });
        fs.writeFileSync(process.argv[2], Buffer.from(artifact.data as ArrayBuffer));
    } else {
        console.error("Last successful run on default branch doesn't have snapshot baseline as artifact.");
        process.exit(1);
    }
})();
