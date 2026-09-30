// Filename: client/src/components/animations/SplitText.jsx
// (Final, super-stable version using useInView instead of ScrollTrigger)

import React, { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SplitText = ({
  text,
  tag = 'p',
  className = '',
  splitType = 'chars',
  from = { opacity: 0, y: 20 },
  stagger = 0.03,
  delay = 0,
  duration = 0.6,
  ease = 'power3.out',
}) => {
  const compRef = useRef(null);
  
  // useInView hook setup
  const { ref, inView } = useInView({
    threshold: 0.2, // Animate when 20% of the element is visible
    triggerOnce: true, // Animate only once
  });

  useGSAP(() => {
    if (!compRef.current || !inView) return; // Animate only when in view

    const elements = String(text).split('').map(char => {
      const el = document.createElement('span');
      el.textContent = char === ' ' ? '\u00A0' : char;
      el.style.display = 'inline-block';
      el.style.visibility = 'hidden'; // Start as hidden
      return el;
    });

    compRef.current.innerHTML = '';
    elements.forEach(el => compRef.current.appendChild(el));
    
    // Make elements visible before animating
    gsap.set(elements, { visibility: 'visible' });

    gsap.from(elements, {
      ...from,
      duration,
      ease,
      stagger,
      delay,
    });

  }, { dependencies: [inView, text], scope: compRef });

  const Tag = tag;

  // We use the 'ref' from useInView to trigger the animation
  return <Tag ref={ref} className={className}>{text}</Tag>;
};

export default SplitText;