'use server'
import fs from 'fs/promises';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function writeupRender(writeup: string) {
  const filePath = path.join(process.cwd(), 'public', 'writeups', `${writeup}.md`);
  const markdown = await fs.readFile(filePath, 'utf8');

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {markdown}
    </ReactMarkdown>
  );
}