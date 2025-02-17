import React from 'react';
import Link from 'next/link';

function Writeups() {
    const writeups = [
        { name: 'DeadFace 2024 DaCube', link: '/writeups/DeadFace-2024-DaCube' },
        { name: 'Bearcat World Tour 2025', link: '/writeups/Bearcat-World-Tour-2025' },
    ];

    return (
        <div style={{ margin: '20px', marginTop: '30px', textAlign: 'center' }}>
            <h1>Writeups</h1>
            <ul style={{ listStyleType: 'none', padding: 0, fontSize: '25px' }}>
                {writeups.map((writeup, index) => (
                    <li key={index}>
                        <Link href={writeup.link}>
                            {writeup.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Writeups;