import React from 'react';
import { Github, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      padding: '60px 20px', 
      borderTop: '1px solid var(--border-glass)', 
      marginTop: '100px',
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <a href="#" style={{ color: 'var(--text-muted)' }}><Twitter size={20} /></a>
        <a href="#" style={{ color: 'var(--text-muted)' }}><Instagram size={20} /></a>
        <a href="#" style={{ color: 'var(--text-muted)' }}><Github size={20} /></a>
        <a href="#" style={{ color: 'var(--text-muted)' }}><Mail size={20} /></a>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
        © 2026 VIDALIS.AI - Automatización Viral para Músicos de Élite.
      </p>
    </footer>
  );
};

export default Footer;
