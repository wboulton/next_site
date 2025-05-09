import fs from 'fs/promises';
import path from 'path';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const customRenderers = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return (
      <img
        src= {path.join(process.cwd(), 'src', 'app', 'DaCube', `${props.src}`)}
        alt={props.alt || ''}
        style={{ width: 'auto', height: 'auto', margin: '10px' }}
      />
    );
  },
};

export default async function writeupRender() {
  const filePath = path.join(process.cwd(), 'src', 'app', 'DaCube', 'DeadFace-2024-DaCube.md');
  const markdown = await fs.readFile(filePath, 'utf8');

  return (
    <Markdown remarkPlugins={[remarkGfm]} components={customRenderers}>
      {markdown}
    </Markdown>
  );
}