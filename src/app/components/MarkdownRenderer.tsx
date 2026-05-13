import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './markdown.css';

type MarkdownRendererProps = {
  content: string;
  imageBasePath?: string;
};

const MarkdownRenderer = ({ content, imageBasePath }: MarkdownRendererProps) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        img: (props) => {
          const src = typeof props.src === 'string' ? props.src : '';
          const isAbsolute = /^(https?:)?\/\//.test(src) || src.startsWith('/');
          const finalSrc =
            isAbsolute || !imageBasePath
              ? src
              : `${imageBasePath.replace(/\/$/, '')}/${src}`;
          return <img src={finalSrc} alt={props.alt || ''} loading="lazy" />;
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          if (match) {
            // All visual styling lives in markdown.css under `.code-block`.
            return (
              <SyntaxHighlighter
                PreTag="div"
                language={match[1].toLowerCase()}
                style={oneDark}
                className="code-block"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
};

export default MarkdownRenderer;
