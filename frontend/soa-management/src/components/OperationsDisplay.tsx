import React, { useState, useEffect } from 'react';
import { Checkbox, Typography, Button, Card, CardContent, Grid, Box, Dialog, DialogActions, DialogContent, DialogTitle, } from '@mui/material';
import { ArrowForward, ArrowBack, Visibility } from '@mui/icons-material';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Connexion au serveur Socket.IO

type OperationRecord = {
  id: number;
  soa_id: number;
  annee: number;
  recensement: number;
  attribution: number;
  retrait: number;
  bail: number;
  devis: number;
  quitus: number;
  etatdeslieux: number;
  devis_pdf?: string;
  soa_nom: string;
  commune_id: number;
};

const fetchOperations = async (year: number) => {
  try {
    const response = await fetch(`http://localhost:5000/api/operations?annee=${year}`);
    const data = await response.json();
    console.log('Données récupérées:', data); // Pour vérifier les données reçues
    return Array.isArray(data) ? data : []; // Assurez-vous que data est un tableau
  } catch (error) {
    console.error('Erreur lors de la récupération des opérations:', error);
    return [];
  }
};


const OperationsDisplay: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [operationsData, setOperationsData] = useState<OperationRecord[]>([]);
  const [previewPDF, setPreviewPDF] = useState<string | null>(null); // Pour visualiser le PDF

  const loadOperations = async () => {
    const data = await fetchOperations(currentYear);
    setOperationsData(data);
  };

  useEffect(() => {
    loadOperations();

    // Écouter les événements de mise à jour
    socket.on('operation-updated', loadOperations);

    // Nettoyer l'écouteur à la fin
    return () => {
      socket.off('operation-updated');
    };
  }, [currentYear]);

  const nextYear = () => setCurrentYear((prev) => prev + 1);
  const prevYear = () => setCurrentYear((prev) => (prev > 2024 ? prev - 1 : prev));

  const regions = [
    { name: 'ANTSIRABE I', id: 1 },
    { name: 'ANTSIRABE II', id: 2 },
    { name: 'BETAFO', id: 3 },
    { name: 'AMBATOLAMPY', id: 4 },
    { name: 'ANTANIFOTSY', id: 5 },
    { name: 'FARATSIHO', id: 6 },
    { name: 'MANDOTO', id: 7 },
  ];

  const operationsByRegion = regions.map(({ name, id }) => ({
    region: name,
    operations: operationsData.filter(operation => operation.commune_id === id),
  }));

  const handlePreviewPDF = (operationId: number) => {
    console.log('ID de l\'opération :', operationId); // Pour vérifier si l'ID est bien défi
    const pdfUrl = `http://localhost:5000/api/operations/${operationId}/devis_pdf`;
    setPreviewPDF(pdfUrl);
  };    

  const handleClosePreviewPDF = () => {
    setPreviewPDF(null);
  };

  return (
    <div style={{ paddingTop: '25px', paddingLeft: '0px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Button variant="contained" color="primary" onClick={prevYear} startIcon={<ArrowBack />}>
          Année Précédente
        </Button>
        <Typography variant="h4" gutterBottom>
          {currentYear}
        </Typography>
        <Button variant="contained" color="primary" onClick={nextYear} endIcon={<ArrowForward />}>
          Année Suivante
        </Button>
      </div>

      <Grid container spacing={1}>
        {operationsByRegion.map(({ region, operations }) => (
          <Grid item xs={12} sm={6} md={1.7} lg={1.7} key={region}>
            <Typography variant="h5" align="center" gutterBottom>
              {region}
            </Typography>
            <Grid container spacing={1}>
              {operations.length > 0 ? (
                operations.map((operation) => (
                  <Grid item xs={12} key={operation.soa_id}>
                    <Card sx={{ minWidth: 180, height: '100%', margin: '0.5cm' }}>
                      <CardContent>
                      <Box 
                        sx={{
                              border: '1px solid #ccc', // Couleur et taille de la bordure
                              padding: '8px', // Espace autour du texte
                              borderRadius: '4px', // Bordures arrondies
                              display: 'inline-block', // Pour que le cadre s'ajuste au texte
                              backgroundColor: '#d3b8a6',
                        }}
                      >
                        <Typography 
                          align="center" 
                          style={{ fontSize: '14px', color: '#000000' }} // Taille de police personnalisée
                        >
                          {operation.soa_nom}
                        </Typography>
                      </Box>
                        {['recensement', 'attribution', 'retrait', 'bail', 'devis', 'quitus', 'etatdeslieux'].map((key) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <Checkbox
                              checked={!!operation[key as keyof OperationRecord]}
                              disabled
                              sx={{
                                '&.Mui-checked': {
                                  color: 'green',
                                },
                              }}
                            />
                            <Typography variant="body2" style={{ marginLeft: '8px', whiteSpace: 'nowrap' }}>
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </Typography>
                            {key === 'devis' && operation.devis ? (
                              <Visibility 
                              style={{ marginLeft: '5px', color: '#000000', cursor: 'pointer' }}
                              onClick={() => handlePreviewPDF(operation.id)} // Utiliser operation.id et non operation.soa_id
                            />                                                       
                            ) : null}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Typography variant="body2" align="center" style={{ margin: '0.5cm' }}>
                  Aucune opération disponible
                </Typography>
              )}
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Dialog open={!!previewPDF} onClose={handleClosePreviewPDF} fullWidth maxWidth="md">
        <DialogTitle>Aperçu du fichier</DialogTitle>
        <DialogContent>
          {previewPDF && (
            <iframe
              src={previewPDF}
              style={{ width: '100%', height: '500px' }}
              title="PDF Preview"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreviewPDF} color="secondary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OperationsDisplay;
