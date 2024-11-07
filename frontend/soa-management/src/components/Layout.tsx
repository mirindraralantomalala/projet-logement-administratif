// Layout.tsx
import React from 'react';
import Menu from './Menu';
import { Box } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Menu />
      <Box sx={{ marginTop: '70px' }}>{children}</Box> {/* Décalage pour éviter le menu */}
    </>
  );
};

export default Layout;
