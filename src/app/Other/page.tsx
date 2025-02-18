import React from 'react';
import ImageContent from './ImageContent';
import fs from 'fs/promises';
import path from 'path';

async function fetchImages() {
  const filePath = path.join(process.cwd(), 'public', 'Dog', 'images.json');
  const data = await fs.readFile(filePath, 'utf8');
  const images = JSON.parse(data);

  return images;
}

const Other = async () => {
  const images = await fetchImages();
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Doggo</h1>
      <p style={{ textAlign: 'center' }}>just some pictures of my dog for now</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <ImageContent images={images} />
      </div>
    </div>
  );
};

export default Other;