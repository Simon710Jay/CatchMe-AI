/**
 * Sanitizes a string for use as a Git branch name.
 * - Lowercase only
 * - Replaces spaces and underscores with hyphens
 * - Removes non-alphanumeric characters (except hyphens and slashes)
 * - Removes leading/trailing hyphens/slashes
 */
export const sanitizeBranchName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/[^a-z0-9-/]/g, '') // Remove non-alphanumeric except - and /
    .replace(/^[/-]+|[/-]+$/g, ''); // Remove leading/trailing - and /
};
