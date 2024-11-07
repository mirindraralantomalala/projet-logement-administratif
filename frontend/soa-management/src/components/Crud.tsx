import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import axios from 'axios';

const Crud = () => {
  const [soaName, setSoaName] = useState('');

  const handleAddSoa = () => {
    // Logique pour ajouter un SOA
    axios.post('/api/soa', { name: soaName }).then((response) => {
      console.log('SOA ajouté: ', response.data);
    });
  };

  return (
    <div>
      <TextField label="Nom du SOA" value={soaName} onChange={(e) => setSoaName(e.target.value)} />
      <Button variant="contained" onClick={handleAddSoa}>
        Ajouter SOA
      </Button>
    </div>
  );
};

export default Crud;
