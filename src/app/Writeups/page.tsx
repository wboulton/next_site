import React from 'react';
import Link from 'next/link';
import WriteupList from './writeupList';

function Writeups() {
    const writeups = [
        { title: 'DeadFace 2024 DaCube', link: '/DeadFace-2024-DaCube' },
        { title: 'Bearcat World Tour 2025', link: '/Bearcat-World-Tour-2025' },
    ];

    return (
        <div style={{ margin: '20px', marginTop: '30px', textAlign: 'center' }}>
            <h1>Writeups</h1>
            <WriteupList writeups={writeups} />
        </div>
    );
}

export default Writeups;