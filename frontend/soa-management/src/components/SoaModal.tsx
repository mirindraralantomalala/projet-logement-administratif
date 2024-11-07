import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { toast } from 'react-toastify'; // Import correct de toast
import 'react-toastify/dist/ReactToastify.css';  // Importer le style pour les notifications

interface Soa {
  id: number;
  nom: string;
  commune_id: number;
}

interface SoaModalProps {
  open: boolean;
  onClose: () => void;
  soa?: Soa | null;  // Optionnel car lors de l'ajout, pas de SOA existant
  onSave: (soaData: { nom: string; commune_id: number }) => void;
  commune_id: number;  // Commune associée à ce SOA
}

const SoaModal: React.FC<SoaModalProps> = ({ open, onClose, soa, onSave, commune_id }) => {
  const [nom, setNom] = useState('');
  const [commune_idValue, setCommuneIdValue] = useState<number>(commune_id);

  // Mettre à jour les champs du formulaire si un SOA est sélectionné pour modification
  useEffect(() => {
    if (soa) {
      setNom(soa.nom);
      setCommuneIdValue(soa.commune_id);
    } else {
      // Réinitialiser le formulaire si on ajoute un nouveau SOA
      setNom('');
      setCommuneIdValue(commune_id);
    }
  }, [soa, commune_id]);

  const handleSave = () => {
    if (nom.trim() === '' || commune_idValue === null) {
      toast.error('Le nom du SOA est requis');  // Afficher une erreur si le champ est vide
      return;
    }

    // Appeler la fonction de sauvegarde fournie par le parent
    onSave({ nom, commune_id: commune_idValue });
    
    // Afficher la notification de succès
    toast.success(`${soa ? 'SOA modifié' : 'SOA ajouté'} avec succès !`);

    // Retarder la fermeture de la modale pour permettre à la notification de s'afficher
    setTimeout(() => {
      onClose();
    }, 2000);  // Délai de 2 secondes avant la fermeture du modal
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: '8px',
      }}>
        <Typography variant="h6" gutterBottom>
          {soa ? 'Modifier' : 'Ajouter'} SOA
        </Typography>
        <TextField
          label="Nom du SOA"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleSave} color="success" variant="contained" fullWidth>
          {soa ? 'Modifier' : 'Ajouter'}
        </Button>
        <Button onClick={onClose} color="primary" variant="outlined" fullWidth sx={{ mt: 2, backgroundColor: 'red' }}>
          Annuler
        </Button>
      </Box>
    </Modal>
  );
};

export default SoaModal;
