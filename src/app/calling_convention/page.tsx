import fs from 'fs/promises';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const customRenderers = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return (
      <img
        src={`/Writeups/${props.src}`}
        alt={props.alt || ''}
        style={{ width: 'auto', height: 'auto', margin: '10px' }}
      />
    );
  },
};

export default async function writeupRender() {
  const filePath = path.join(process.cwd(), 'src', 'app', 'calling_convention', 'Bearcat-World-Tour-2025.md');
  const markdown = await fs.readFile(filePath, 'utf8');

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={customRenderers}>
      {markdown}
    </ReactMarkdown>
  );
}