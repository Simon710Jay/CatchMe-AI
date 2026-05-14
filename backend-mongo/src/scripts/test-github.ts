import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const testGithub = async () => {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  console.log('Testing GitHub Integration...');
  console.log(`Owner: ${owner}`);
  console.log(`Repo: ${repo}`);
  console.log(`Token: ${token?.substring(0, 10)}...`);

  const octokit = new Octokit({ auth: token });

  try {
    console.log('\n1. Testing Auth (getAuthenticated)...');
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`✅ Auth successful! Authenticated as: ${user.login}`);

    console.log('\n2. Testing Repo Access (get)...');
    const { data: repoData } = await octokit.rest.repos.get({
      owner: owner!,
      repo: repo!,
    });
    console.log(`✅ Repo access successful! Default branch: ${repoData.default_branch}`);

    console.log('\n3. Testing Scopes...');
    // Fine-grained tokens don't show scopes in headers the same way, but we can try a write operation (dry-run-ish)
    console.log('Note: Manual check of token permissions on GitHub is recommended (needs "Contents: write" and "Pull Requests: write")');

  } catch (error: any) {
    console.error('\n❌ GITHUB TEST FAILED');
    console.error(`Status: ${error.status}`);
    console.error(`Message: ${error.message}`);
    if (error.response) {
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testGithub();
