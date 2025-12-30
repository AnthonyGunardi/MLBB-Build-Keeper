import '@testing-library/jest-dom';

// Mock scrollIntoView for JSDOM
Element.prototype.scrollIntoView = vi.fn();
