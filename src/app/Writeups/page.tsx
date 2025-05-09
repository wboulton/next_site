import React from 'react';
import { useRouter } from 'next/navigation';

function WriteupList({ writeups }: { writeups: { title: string; link: string }[] }) {
    const router = useRouter();

    const handleRedirect = (link: string) => {
        router.push(link);
    };

    return (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
            {writeups.map((writeup, index) => (
                <li
                    key={index}
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', margin: '10px 0' }}
                    onClick={() => handleRedirect(writeup.link)}
                >
                    {writeup.title}
                </li>
            ))}
        </ul>
    );
}

export default WriteupList;