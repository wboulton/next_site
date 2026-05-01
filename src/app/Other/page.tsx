import fs from 'fs/promises';
import path from 'path';
import ImageContent from './ImageContent';
import './other.css';

async function fetchImages(): Promise<string[]> {
  const filePath = path.join(process.cwd(), 'public', 'Dog', 'images.json');
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

export default async function OtherPage() {
  const images = await fetchImages();

  return (
    <div className="page-shell">
      <main className="page-main page-main-narrow">
        <article className="article article-wide">
          <header className="article-header">
            <div className="article-eyebrow">Other</div>
            <h1 className="article-title">Doggo</h1>
            <p className="article-subtitle">Just some pictures of my dog for now.</p>
          </header>
          <ImageContent images={images} />
        </article>
      </main>
    </div>
  );
}
