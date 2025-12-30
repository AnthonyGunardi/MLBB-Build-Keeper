import React, { forwardRef, useId } from 'react';
import styles from './TechInput.module.css';

/**
 * TechInput Component
 * Styled input field with support for labels and error handling.
 *
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.className]
 * @param {boolean} [props.textarea=false]
 * @param {string} [props.id]
 * @param {Object} props.rest - Input props like value, onChange, placeholder, etc.
 */
const TechInput = forwardRef(({ label, error, className = '', textarea = false, id, ...rest }, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const Component = textarea ? 'textarea' : 'input';

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <Component id={inputId} ref={ref} className={`${styles.input} ${error ? styles.error : ''}`} {...rest} />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

TechInput.displayName = 'TechInput';

export default TechInput;
