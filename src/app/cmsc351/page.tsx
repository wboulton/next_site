import fs from 'fs/promises';
import path from 'path';
import WriteupLayout from '../components/WriteupLayout';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default async function Cmsc351Page() {
  const filePath = path.join(
    process.cwd(),
    'src',
    'app',
    'cmsc351',
    'cmsc351.md'
  );
  const markdown = await fs.readFile(filePath, 'utf8');

  return (
    <WriteupLayout
      currentSlug="cmsc351"
      title="cmsc351"
      subtitle="Reverse-engineering a stripped binary from UMDCTF 2025."
    >
      <MarkdownRenderer content={markdown} imageBasePath="/writeups" />
    </WriteupLayout>
  );
}
