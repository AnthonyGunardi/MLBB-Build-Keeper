import React from 'react';
import styles from './TechCard.module.css';

/**
 * TechCard Component
 * A glassmorphism card with tech accents.
 *
 * @param {Object} props
 * @param {string} [props.title] - Optional title for the card header
 * @param {boolean} [props.hoverEffect=false] - Whether to enable hover animations
 * @param {boolean} [props.animatedCorners=false] - Whether to show tech corner decorations
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
const TechCard = ({ title, hoverEffect = false, animatedCorners = false, className = '', children, ...rest }) => {
  return (
    <div className={`${styles.card} ${hoverEffect ? styles.hoverEffect : ''} ${className}`} {...rest}>
      {animatedCorners && <div className={`${styles.cornerDecor} ${styles.topLeft}`} />}
      {animatedCorners && <div className={`${styles.cornerDecor} ${styles.bottomRight}`} />}

      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default TechCard;
