import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';

const WriteupContent = () => {
  const router = useRouter();
  const { writeup } = router.query;
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchMarkdown = async () => {
      if (!writeup) return;

      try {
        const response = await fetch(`/writeups/${writeup}.md`);
        if (!response.ok) {
          throw new Error('Markdown file not found');
        }
        const text = await response.text();
        setContent(text);
      } catch (error) {
        if (error instanceof Error) {
          setContent(`# Error\n\n${error.message}`);
        } else {
          setContent('# Error\n\nAn unknown error occurred');
        }
      }
    };

    fetchMarkdown();
  }, [writeup]);

  return (
    <div style={{ margin: '20px', marginTop: '30px', textAlign: 'center' }}>
      <h1>{(Array.isArray(writeup) ? writeup.join(' ') : writeup || '').replace(/-/g, ' ')}</h1>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default WriteupContent;