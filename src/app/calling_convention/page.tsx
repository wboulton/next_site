import fs from 'fs/promises';
import path from 'path';
import WriteupLayout from '../components/WriteupLayout';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default async function CallingConventionPage() {
  const filePath = path.join(
    process.cwd(),
    'src',
    'app',
    'calling_convention',
    'Bearcat-World-Tour-2025.md'
  );
  const markdown = await fs.readFile(filePath, 'utf8');

  return (
    <WriteupLayout
      currentSlug="calling_convention"
      title="Calling Convention"
      subtitle="Return-oriented setup of a multi-key win condition from Bearcat World Tour 2025."
    >
      <MarkdownRenderer content={markdown} imageBasePath="/writeups" />
    </WriteupLayout>
  );
}
