import { getServerSideProps } from '../Other/ImageContent';
import ImageContent from '../Other/ImageContent';

export default async function Other() {
    const { props } = await getServerSideProps();

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Doggo</h1>
      <p style={{ textAlign: 'center' }}>just some pictures of my dog for now</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {<ImageContent images={props.images} />}
      </div>
    </div>
  );
}