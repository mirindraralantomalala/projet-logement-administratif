import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './App.css'; // Importer les styles globaux
import SoaListWrapper from './components/SoaListWrapper';
import SoaPage from './pages/SoaPage';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute'; // Assurez-vous que PrivateRoute est bien importé
import Layout from './components/Layout'; // Importer le Layout
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify'; // Importer toast et ToastContainer

// Import des nouvelles pages
import Recensement from './pages/Recensement';
import Attribution from './pages/Attribution';
import Retrait from './pages/Retrait';
import Bail from './pages/Bail';
import Etatdeslieux from './pages/Etatdeslieux';

const SoaPageWrapper = () => {
  const { region } = useParams<{ region: string }>();
  return <SoaPage region={region!} />;
};

const App: React.FC = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#FFFFFF',
      },
      secondary: {
        main: '#FF5722',
      },
      background: {
        default: 'transparent',
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
      h1: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333333',
      },
      body1: {
        fontSize: '1rem',
        color: '#555555',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-wrapper">
        <Router>
          <Routes>
            {/* Route publique pour la connexion */}
            <Route path="/login" element={<Login />} />

            {/* Route protégée par PrivateRoute */}
            <Route
              path="/menu"
              element={
                <PrivateRoute>
                  <Layout>
                    {/* Contenu pour le menu ici */}
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Route protégée pour SOA par région */}
            <Route
              path="/soa/:region"
              element={
                <PrivateRoute>
                  <Layout>
                    <SoaListWrapper />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Route protégée pour la page détaillée des SOA */}
            <Route
              path="/soaPage/:region"
              element={
                <PrivateRoute>
                  <Layout>
                    <SoaPageWrapper />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Nouvelles routes protégées */}
            <Route
              path="/recensement"
              element={
                <PrivateRoute>
                  <Layout>
                    <Recensement />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/attribution"
              element={
                <PrivateRoute>
                  <Layout>
                    <Attribution />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/retrait"
              element={
                <PrivateRoute>
                  <Layout>
                    <Retrait />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/bail"
              element={
                <PrivateRoute>
                  <Layout>
                    <Bail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/etatdeslieux"
              element={
                <PrivateRoute>
                  <Layout>
                    <Etatdeslieux />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Redirection par défaut vers la page de connexion */}
            <Route path="*" element={<Login />} />
          </Routes>
        </Router>

        {/* ToastContainer doit être au niveau de l'application */}
        <ToastContainer
          position="top-right"
          autoClose={3000} // Durée de la notification de 3 secondes
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          pauseOnFocusLoss
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
