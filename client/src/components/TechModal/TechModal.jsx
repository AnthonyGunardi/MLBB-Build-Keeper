import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './TechModal.module.css';
import TechButton from '../TechButton';
import TechCard from '../TechCard';

/**
 * TechModal Component
 * A modal dialog using the Tech design system.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {string} [props.title]
 * @param {React.ReactNode} props.children
 */
const TechModal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        <TechCard className={styles.modal} title={title} animatedCorners>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
          {children}
        </TechCard>
      </div>
    </div>,
    document.body
  );
};

export default TechModal;
