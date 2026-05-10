import { broadcast } from '../websocket/socket';
import { GitHubPR } from './githubTypes';

export const githubEvents = {
  emitPROpened: (prData: GitHubPR) => {
    broadcast('pr-opened', prData);
  },
  emitPRStatusUpdated: (prData: GitHubPR) => {
    broadcast('pr-status-updated', prData);
  },
};
