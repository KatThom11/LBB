import { readFile } from 'node:fs/promises';
import path from 'node:path';
import LivingNotebook from '@/components/LivingNotebook';
export default async function Page() {
  const proposal = await readFile(path.join(process.cwd(), 'docs/LIVING_NOTEBOOK_WORKING_DRAFT.txt'), 'utf8');
  return <LivingNotebook proposal={proposal} />;
}
