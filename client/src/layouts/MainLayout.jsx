import TechNavbar from '../components/TechNavbar';
import ChatWidget from '../components/Chat/ChatWidget';

/**
 * MainLayout
 * Wraps the protected/public pages with the TechNavbar and proper spacing.
 */
const MainLayout = ({ children, hideNavbar = false }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideNavbar && <TechNavbar />}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>

      {/* Optional: Add a footer here later if needed */}
      <footer
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--tech-text-muted)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: '0.8rem',
          marginTop: 'auto'
        }}
      >
        <p>© {new Date().getFullYear()} ANTHONY GUNARDI. ALL RIGHTS RESERVED.</p>
      </footer>
      {/* AI Coach Widget */}
      <ChatWidget />
    </div>
  );
};

export default MainLayout;
