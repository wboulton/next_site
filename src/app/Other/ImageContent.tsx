const ImageContent = ({ images }: { images: string[] }) => {
  return (
    <div className="dog-grid">
      {images.map((image, index) => (
        <img key={index} src={`/Dog/${image}`} alt={`Dog ${index + 1}`} />
      ))}
    </div>
  );
};

export default ImageContent;
