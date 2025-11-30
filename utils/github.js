// GitHub API helper for committing files from serverless functions
import { Octokit } from '@octokit/rest';

export class GitHubCommitter {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.owner = process.env.GITHUB_REPO_OWNER || 'ttarigh';
    this.repo = process.env.GITHUB_REPO_NAME || 'everyday';
    this.branch = 'main';
    
    if (!this.token) {
      throw new Error('GITHUB_TOKEN environment variable not set');
    }
    
    this.octokit = new Octokit({ auth: this.token });
  }

  /**
   * Commit a file to the repository
   * @param {string} path - Path in repo (e.g., 'public/tagged/image.png')
   * @param {Buffer|string} content - File content (Buffer for binary, string for text)
   * @param {string} message - Commit message
   * @param {boolean} isBinary - Whether content is binary (default: true)
   */
  async commitFile(path, content, message, isBinary = true) {
    try {
      // Convert content to base64
      const contentBase64 = isBinary 
        ? content.toString('base64')
        : Buffer.from(content).toString('base64');

      // Try to get existing file SHA (in case it exists)
      let sha;
      try {
        const { data } = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: path,
          ref: this.branch,
        });
        sha = data.sha;
      } catch (error) {
        // File doesn't exist, which is fine for new files
        sha = undefined;
      }

      // Create or update the file
      const response = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: path,
        message: message,
        content: contentBase64,
        branch: this.branch,
        ...(sha && { sha }), // Include SHA if updating existing file
      });

      console.log(`✓ Committed ${path} to GitHub`);
      return response.data;
    } catch (error) {
      console.error(`Error committing ${path} to GitHub:`, error.message);
      throw error;
    }
  }

  /**
   * Commit multiple files in a single commit
   * @param {Array} files - Array of {path, content, isBinary} objects
   * @param {string} message - Commit message
   */
  async commitMultipleFiles(files, message) {
    try {
      // Get the latest commit SHA
      const { data: refData } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${this.branch}`,
      });
      const latestCommitSha = refData.object.sha;

      // Get the tree of the latest commit
      const { data: commitData } = await this.octokit.git.getCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: latestCommitSha,
      });
      const baseTreeSha = commitData.tree.sha;

      // Create blobs for each file
      const tree = await Promise.all(
        files.map(async ({ path, content, isBinary = true }) => {
          const contentBase64 = isBinary
            ? content.toString('base64')
            : Buffer.from(content).toString('base64');

          const { data: blobData } = await this.octokit.git.createBlob({
            owner: this.owner,
            repo: this.repo,
            content: contentBase64,
            encoding: 'base64',
          });

          return {
            path: path,
            mode: '100644',
            type: 'blob',
            sha: blobData.sha,
          };
        })
      );

      // Create a new tree
      const { data: newTreeData } = await this.octokit.git.createTree({
        owner: this.owner,
        repo: this.repo,
        base_tree: baseTreeSha,
        tree: tree,
      });

      // Create a new commit
      const { data: newCommitData } = await this.octokit.git.createCommit({
        owner: this.owner,
        repo: this.repo,
        message: message,
        tree: newTreeData.sha,
        parents: [latestCommitSha],
      });

      // Update the reference
      await this.octokit.git.updateRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${this.branch}`,
        sha: newCommitData.sha,
      });

      console.log(`✓ Committed ${files.length} files to GitHub in single commit`);
      return newCommitData;
    } catch (error) {
      console.error('Error committing multiple files to GitHub:', error.message);
      throw error;
    }
  }
}

