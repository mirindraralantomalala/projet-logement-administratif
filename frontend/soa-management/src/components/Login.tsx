import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const adminUsername = 'logement'; // Identifiant admin
    const adminPassword = 'logement'; // Mot de passe admin

    // Vérification des informations d'identification
    if (username === adminUsername && password === adminPassword) {
      localStorage.setItem('auth', 'true'); // Stocke l'état d'authentification dans localStorage
      navigate('/menu'); // Redirection vers le menu après authentification
    } else {
      setError('Identifiant ou mot de passe incorrect');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#F7E9DA',
      }}
    >
      <Box
        sx={{
          width: '400px',
          padding: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            color: '#333333',
            marginBottom: '20px',
          }}
        >
          Authentification
        </Typography>
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <TextField
            label="Identifiant"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="off"
            sx={{
              borderRadius: '8px',
              backgroundColor: '#FFFDF7',
              input: { padding: '10px' },
            }}
          />
          <TextField
            label="Mot de passe"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
            sx={{
              borderRadius: '8px',
              backgroundColor: '#FFFDF7',
              input: { padding: '10px' },
            }}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#4E7C71',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 0',
              fontWeight: 'bold',
            }}
          >
            Connexion
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
