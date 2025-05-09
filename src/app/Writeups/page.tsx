import React from 'react';
import { redirect } from 'next/navigation';

const writeups = [
    { title: 'deadface2024', route: '/DaCube' },
    { title: 'UC2025', route: '/calling_convention' },
    { title: 'umd2025', route: '/cmsc351'}
  ];

function WriteupList({ writeups }: { writeups: { title: string; route: string }[] }) {
    return (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
            {writeups.map((writeup, index) => (
                <li
                    key={index}
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', margin: '10px 0' }}
                    onClick={() => redirect(writeup.route)}
                >
                    {writeup.title}
                </li>
            ))}
        </ul>
    );
}

export default function Page() {
    return <WriteupList writeups={writeups} />;
}