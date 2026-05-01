import fs from 'fs/promises';
import path from 'path';
import WriteupLayout from '../components/WriteupLayout';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default async function DaCubePage() {
  const filePath = path.join(
    process.cwd(),
    'src',
    'app',
    'DaCube',
    'DeadFace-2024-DaCube.md'
  );
  const markdown = await fs.readFile(filePath, 'utf8');

  return (
    <WriteupLayout
      currentSlug="DaCube"
      title="DaCube"
      subtitle="A Rubik's-cube crypto challenge from DeadFace CTF 2024."
    >
      <MarkdownRenderer content={markdown} imageBasePath="/writeups" />
    </WriteupLayout>
  );
}
