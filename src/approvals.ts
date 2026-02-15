import { join } from 'node:path';
import fs from 'fs';

const SAFE_COMMANDS = ['ls', 'cat', 'head', 'tail', 'date', 'whoami', 'echo', 'pwd'];
const DANGEROUS_PATTERNS = [/\brm\b/, /\bsudo\b/, /\bchmod\b/, /\bcurl.*\|.*sh/];

const APPROVALS_FILE = join(process.cwd(), 'settings', 'exec-approvals.json');

const loadApprovals = (): { allowed: string[]; denied: string[] } => {
  try {
    const approvals = fs.readFileSync(APPROVALS_FILE, 'utf-8');
    return JSON.parse(approvals);
  } catch {
    return { allowed: [], denied: [] };
  }
};

export const saveApproval = (command: string, approved: boolean) => {
  const approvals = loadApprovals();
  const key = approved ? 'allowed' : 'denied';
  const list = approvals[key];

  if (!list.includes(command)) {
    approvals[key].push(command);
  }

  fs.writeFileSync(APPROVALS_FILE, JSON.stringify(approvals, null, 2));
};

export const checkCmdSafety = (command: string): 'safe' | 'approved' | 'needs_approval' | 'denied' => {
  const baseCmd = command.trim().split(' ').at(0) ?? '';

  if (SAFE_COMMANDS.includes(baseCmd)) {
    return 'safe';
  }

  const approvals = loadApprovals();
  if (approvals.allowed.includes(baseCmd)) {
    return 'approved';
  }
  // completely ban the dangerous patterns - can be reverted to just 'needs_approval'
  const isDangerous = DANGEROUS_PATTERNS.some((pattern) => pattern.test(baseCmd));
  return isDangerous ? 'denied' : 'needs_approval';
};
