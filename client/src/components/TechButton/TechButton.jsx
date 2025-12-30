import React from 'react';
import styles from './TechButton.module.css';

/**
 * TechButton Component
 * A futuristic button with angled corners and glow effects.
 *
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger'} [props.variant='primary']
 * @param {boolean} [props.filled=false]
 * @param {Function} [props.onClick]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {Object} [props.rest] - Any other props to pass to the button
 */
const TechButton = ({ variant = 'primary', filled = false, className = '', children, onClick, ...rest }) => {
  const variantClass = styles[variant] || styles.primary;
  const filledClass = filled ? styles.filled : '';

  return (
    <button className={`${styles.button} ${variantClass} ${filledClass} ${className}`} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default TechButton;
