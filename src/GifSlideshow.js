import React, { useEffect, useState } from 'react';
import './GifSlideshow.css';

// Import images from the imgs folder
import img1 from './imgs/3.webp';
import img2 from './imgs/4.webp';
import img3 from './imgs/something.webp';
import img4 from './imgs/5.webp';
import img5 from './imgs/cat.webp';
import img6 from './imgs/mountain.webp';
import img7 from './imgs/ronaldo.webp';
import img8 from './imgs/dog.webp';
import img9 from './imgs/somename.webp';
import img10 from './imgs/someplace.webp';
import img11 from './imgs/something2.webp';

const GifSlideshow = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Use the imported images in the gifSources array
    const gifSources = [
        img4
    ];
    //, img1, img2, img3, img5, img6, img7, img8, img9, img10, img11
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % gifSources.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [gifSources.length]);

    return (
        <div className="gif-container">
            {gifSources.map((src, index) => (
                <img
                    key={index}
                    src={src}
                    className={`gif ${index === currentIndex ? 'active' : ''}`}
                    alt={`GIF ${index + 1}`}
                />
            ))}
        </div>
    );
};

export default GifSlideshow;
