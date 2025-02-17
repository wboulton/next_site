
const ImageContent = ({ images }: { images: string[] }) => {
  return (
    <div>
      {images.map((image, index) => (
        <img key={index} src={image} alt={`Dog ${index}`} />
      ))}
    </div>
  );
};

export default ImageContent;