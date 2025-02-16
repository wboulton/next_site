'use server'
export async function getServerSideProps() {
    try {
        const response = await fetch('http://localhost:3000/Dog/images.json');
        const data = await response.json();
        return { props: { images: data } };
    } catch (error) {
        console.error('Error fetching images:', error);
        return { props: { images: [] } };
    }
}

export default function ImageContent({ images }: { images: string[] }) {
    return (
        <div>
            {images.map((image, index) => (
                <img key={index} src={image} alt={`Dog ${index}`} />
            ))}
        </div>
    );
}
