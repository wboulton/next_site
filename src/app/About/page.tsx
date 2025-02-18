export default async function About() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px', marginTop: '30px' }}>
        <h1>About Me</h1>
        <p style={{ width: '800px', textAlign: 'center' }}>
          My name is William Boulton. I am a freshman at Purdue University in West Lafayette, Indiana studying computer science with
          a focus on cybersecurity. I am interested in CTFs and offensive security, particularly the reverse engineering category.
        </p>
        <p>Contact me using williamdboulton@gmail.com.</p>
  
        <h2>Links</h2>
        <p>
          LinkedIn: <a href="https://www.linkedin.com/in/william-boulton-a958832ba/" target="_blank" rel="noopener noreferrer">William Boulton</a>
        </p>
        <p>
          Github: <a href="https://github.com/wboulton" target="_blank" rel="noopener noreferrer">wboulton</a>
        </p>
      </div>
    );
  }