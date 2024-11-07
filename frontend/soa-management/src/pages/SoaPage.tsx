import React, { useState, useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import SoaModal from '../components/SoaModal';

interface Soa {
  id: number;
  nom: string;
  commune_id: number;
}

const SoaPage: React.FC<{ region: string }> = ({ region }) => {
  const [soaList, setSoaList] = useState<Soa[]>([]);
  const [selectedSoa, setSelectedSoa] = useState<Soa | null>(null);
  const [modalOpen, setModalOpen] = useState(false); // Gérer l'état d'ouverture du modal

  // Map des régions à leurs ID respectifs
  const commune_idMap: Record<string, number> = {
    'Antsirabe I': 1,
    'Antsirabe II': 2,
    'Betafo': 3,
    'Ambatolampy': 4,
    'Antanifotsy': 5,
    'Faratsiho': 6,
    'Mandoto': 7,
  };

  const commune_id = commune_idMap[region];

  useEffect(() => {
    const fetchSoaList = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/soa?commune_id=${commune_id}`);
        setSoaList(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des données', err);
      }
    };

    if (commune_id) {
      fetchSoaList();
    }
  }, [commune_id]);

  // Fonction de sauvegarde du SOA (ajout ou modification)
  const handleSaveSoa = (soaData: { nom: string; commune_id: number }) => {
    console.log('SOA sauvegardé :', soaData);
    // Logique d'ajout ou modification du SOA ici, selon vos besoins
  };

  return (
    <Box>
      <Typography variant="h4">{region} - Liste des SOA</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 2,
        }}
      >
        {soaList.length === 0 ? (
          <Typography variant="body1">Aucun SOA trouvé pour cette commune.</Typography>
        ) : (
          soaList.map((soa) => (
            <Button
              key={soa.id}
              variant="outlined"
              onClick={() => {
                setSelectedSoa(soa);
                setModalOpen(true); // Ouvre le modal lorsque l'utilisateur clique sur un SOA
              }}
            >
              {soa.nom}
            </Button>
          ))
        )}
      </Box>

      {/* Affichage du SoaModal */}
      {selectedSoa && (
        <SoaModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          soa={selectedSoa}
          onSave={handleSaveSoa}
          commune_id={commune_id} // Passe l'ID de la commune actuelle
        />
      )}
    </Box>
  );
};

export default SoaPage;
