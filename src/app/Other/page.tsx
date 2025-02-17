import React from 'react';
import ImageContent from './ImageContent';

async function fetchImages() {
  let images: string[] = [];

  try {
    const response = await fetch('http://localhost:3000/Dog/images.json');
    images = await response.json();
  } catch (error) {
    console.error('Error fetching images:', error);
  }

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