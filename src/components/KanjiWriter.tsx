'use client';

import { useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';

interface KanjiWriterProps {
    character: string;
    size?: number;
}

export default function KanjiWriter({ character, size = 100 }: KanjiWriterProps) {
    const writerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<HanziWriter | null>(null);

    useEffect(() => {
        if (!writerRef.current) return;

        // Clean up previous instance if character changes
        if (instanceRef.current) {
            // HanziWriter doesn't have a distinct destroy method that removes the SVG, 
            // so we can just clear the innerHTML of the container.
            writerRef.current.innerHTML = '';
        }

        const writer = HanziWriter.create(writerRef.current, character, {
            width: size,
            height: size,
            padding: 5,
            showOutline: true,
            strokeAnimationSpeed: 1, // 1x speed
            delayBetweenStrokes: 200, // ms
            strokeColor: '#4C9AFF', // Our JLPT Blue
            radicalColor: '#1d4ed8', // Darker blue for radical? Or keep uniform? Let's try uniform for now.
            outlineColor: '#DDD',
        });

        instanceRef.current = writer;

        // Add a small delay then animate
        // Interaction: click to animate? Or auto animate on load?
        // Let's auto animate once on load for "Wow" factor.

        // Check if character is actually a kanji? HanziWriter handles errors gracefully usually.
        // It loads data from CDN.

        writer.animateCharacter();

        return () => {
            // cleanup
            if (writerRef.current) writerRef.current.innerHTML = '';
        };
    }, [character, size]);

    return (
        <div
            ref={writerRef}
            className="cursor-pointer bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            title="Click to replay animation"
            onClick={() => instanceRef.current?.animateCharacter()}
        />
    );
}
