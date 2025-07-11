/*import fs from 'fs/promises';
import path from 'path';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

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
  const filePath = path.join(process.cwd(), 'src', 'app', 'cmsc351', 'cmsc351.md');
  const markdown = await fs.readFile(filePath, 'utf8');

  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...customRenderers,
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              PreTag="div"
              language={match[1]}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}*/