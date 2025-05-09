export const writeups = [
    { title: 'deadface2024', route: '/DaCube' },
    { title: 'UC2025', route: '/calling_convention' },
    { title: 'umd2025', route: '/cmsc351' },
  ];
  
  export default function Page() {
    return (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {writeups.map((writeup, index) => (
          <li key={index} style={{ margin: '10px 0' }}>
            <a
              href={writeup.route}
              style={{
                color: '#1d63b3',
                textDecoration: 'underline',
                display: 'block',
                textAlign: 'center',
                fontSize: '24px',
              }}
            >
              {writeup.title}
            </a>
          </li>
        ))}
      </ul>
    );
  }
  