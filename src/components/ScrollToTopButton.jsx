import { useEffect, useState } from 'react';

import './ScrollToTopButton.css';

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top-button"
      onClick={handleClick}
      aria-label="Go to top"
    >
      ↑
    </button>
  );
}

export default ScrollToTopButton;


