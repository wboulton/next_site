'use client'

import React, { useState } from 'react';
import writeupRender from './WriteupContent';
import './writeup.css'

interface Writeup {
    title: string;
    link: string;
}

interface WriteupListProps {
    writeups: Writeup[];
}

const WriteupList: React.FC<WriteupListProps> = ({ writeups }) => {
    const [content, setContent] = useState<React.ReactNode>(null);
    const [isContentVisible, setIsContentVisible] = useState<boolean>(false);

    const handleClick = async (link: string) => {
        const renderedContent = await writeupRender(link);
        setContent(renderedContent);
        setIsContentVisible(true);
    };

    const handleBack = () => {
        setContent(null);
        setIsContentVisible(false);
    };

    return (
        <div>
            {!isContentVisible ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {writeups.map((writeup, index) => (
                <li key={index}>
                    <a href="#" onClick={() => handleClick(writeup.link)}>{writeup.title}</a>
                </li>
                ))}
            </ul>
            ) : (
            <div style={{ textAlign: 'left' }}>
                {content}
                <button className="back-button" onClick={handleBack} style={{ marginTop: '10px' }}>Back</button>
            </div>
            )}
        </div>
    );
};

export default WriteupList;