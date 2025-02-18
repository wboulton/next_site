const ImageContent = ({ images }: { images: string[] }) => {
  return (
    <div>
      {images.map((image, index) => (
        <img key={index} src={`/Dog/${image}`} alt={`Dog ${index}`} 
         style = {{ width: '200px', height: 'auto', margin: '10px' }}/>
      ))}
    </div>
  );
};

export default ImageContent;