// GitHub integration script to push code to repository
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Files/folders to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.cache',
  '.config',
  '.upm',
  'attached_assets',
  '.replit',
  'replit.nix',
  '.breakpoints',
  'generated-icon.png',
  'replit.md',
  '.local',
  'package-lock.json'
];

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (shouldIgnore(relativePath)) continue;
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

async function main() {
  const REPO_NAME = 'chessforge3';
  
  try {
    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);
    
    // Check if repo exists
    console.log(`Connecting to repository ${REPO_NAME}...`);
    let repo;
    try {
      const { data } = await octokit.repos.get({
        owner: user.login,
        repo: REPO_NAME
      });
      repo = data;
      console.log(`Found existing repository: ${repo.html_url}`);
    } catch (e: any) {
      if (e.status === 404) {
        console.log(`Creating repository ${REPO_NAME}...`);
        const { data } = await octokit.repos.createForAuthenticatedUser({
          name: REPO_NAME,
          description: 'Chess game analysis application with Stockfish engine and consciousness level (M-Level) classification',
          private: false,
          auto_init: true
        });
        repo = data;
        console.log(`Repository created: ${repo.html_url}`);
        await new Promise(r => setTimeout(r, 3000));
      } else {
        throw e;
      }
    }
    
    const defaultBranch = repo.default_branch || 'main';
    
    // Check if repo is empty by trying to get default branch
    let isEmptyRepo = false;
    try {
      await octokit.git.getRef({
        owner: user.login,
        repo: REPO_NAME,
        ref: `heads/${defaultBranch}`
      });
    } catch (e: any) {
      if (e.status === 409 || e.status === 404) {
        isEmptyRepo = true;
      }
    }
    
    if (isEmptyRepo) {
      console.log('Repository is empty, initializing with README...');
      // Create initial file using contents API
      await octokit.repos.createOrUpdateFileContents({
        owner: user.login,
        repo: REPO_NAME,
        path: 'README.md',
        message: 'Initial commit',
        content: Buffer.from('# ChessForge3\n\nChess game analysis with M-Level consciousness classification').toString('base64')
      });
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Get all files to upload
    const projectDir = process.cwd();
    const files = getAllFiles(projectDir);
    console.log(`Found ${files.length} files to upload`);
    
    // Get the default branch reference
    const { data: ref } = await octokit.git.getRef({
      owner: user.login,
      repo: REPO_NAME,
      ref: `heads/${defaultBranch}`
    });
    const latestCommitSha = ref.object.sha;
    
    const { data: commit } = await octokit.git.getCommit({
      owner: user.login,
      repo: REPO_NAME,
      commit_sha: latestCommitSha
    });
    const baseTreeSha = commit.tree.sha;
    
    // Create blobs for all files
    console.log('Uploading files...');
    const treeItems: any[] = [];
    let uploaded = 0;
    
    for (const file of files) {
      const filePath = path.join(projectDir, file);
      const content = fs.readFileSync(filePath);
      
      // Check if binary
      const isBinary = content.some(byte => byte === 0);
      
      try {
        const { data: blob } = await octokit.git.createBlob({
          owner: user.login,
          repo: REPO_NAME,
          content: isBinary ? content.toString('base64') : content.toString('utf8'),
          encoding: isBinary ? 'base64' : 'utf-8'
        });
        
        treeItems.push({
          path: file,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });
        
        uploaded++;
        if (uploaded % 10 === 0) {
          console.log(`Uploaded ${uploaded}/${files.length} files...`);
        }
      } catch (e: any) {
        console.log(`Skipping ${file}: ${e.message}`);
      }
    }
    console.log(`Uploaded ${uploaded} files`);
    
    // Create tree
    console.log('Creating commit tree...');
    const { data: tree } = await octokit.git.createTree({
      owner: user.login,
      repo: REPO_NAME,
      base_tree: baseTreeSha,
      tree: treeItems
    });
    
    // Create commit
    console.log('Creating commit...');
    const { data: newCommit } = await octokit.git.createCommit({
      owner: user.login,
      repo: REPO_NAME,
      message: 'Chess analysis app with M-Level consciousness classification\n\n- Stockfish engine integration for game analysis\n- M-Level 0-9 consciousness classification system\n- Phase-by-phase game breakdown\n- PostgreSQL database storage\n- React frontend with analysis visualizations',
      tree: tree.sha,
      parents: [latestCommitSha]
    });
    
    // Update reference
    await octokit.git.updateRef({
      owner: user.login,
      repo: REPO_NAME,
      ref: `heads/${defaultBranch}`,
      sha: newCommit.sha,
      force: true
    });
    
    console.log(`\nSuccess! Code pushed to: https://github.com/${user.login}/${REPO_NAME}`);
    
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

main();
