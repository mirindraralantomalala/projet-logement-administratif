import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Checkbox, Button, IconButton } from '@mui/material';
import axios from 'axios';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Soa {
  id: number;
  nom: string;
}

interface OperationModalProps {
  soa: Soa | null;
  open: boolean;
  onClose: () => void;
}

const OperationModal: React.FC<OperationModalProps> = ({ soa, open, onClose }) => {
  const [checkedItems, setCheckedItems] = useState({
    recensement: false,
    attribution: false,
    retrait: false,
    bail: false,
    devis: false,
    quitus: false,
    etatdeslieux: false,
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Réinitialisation de l'état des cases
    setCheckedItems({
      recensement: false,
      attribution: false,
      retrait: false,
      bail: false,
      devis: false,
      quitus: false,
      etatdeslieux: false,
    });
    setFile(null);

    const fetchOperationData = async () => {
      if (soa) {
        try {
          const response = await axios.get(`http://localhost:5000/api/operations?soa_id=${soa.id}&annee=${new Date().getFullYear()}`);
          console.log('Réponse de l\'API pour récupérer les opérations :', response.data); // Ajouté pour débogage
          const operation = response.data;
          if (operation) {
            setCheckedItems({
              recensement: Boolean(operation.recensement),
              attribution: Boolean(operation.attribution),
              retrait: Boolean(operation.retrait),
              bail: Boolean(operation.bail),
              devis: Boolean(operation.devis),
              quitus: Boolean(operation.quitus),
              etatdeslieux: Boolean(operation.etatdeslieux),
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des opérations existantes', error);
        }
      }
    };

    if (soa) {
      fetchOperationData();
    }
  }, [soa]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!soa) return;

    const annee = new Date().getFullYear();
    const formData = new FormData();
    formData.append('soa_id', String(soa.id));
    formData.append('annee', String(annee));

    // Ajoutez chaque checkbox au formData en tant que '1' ou '0'
    formData.append('recensement', checkedItems.recensement ? 'true' : 'false');
    formData.append('attribution', checkedItems.attribution ? 'true' : 'false');
    formData.append('retrait', checkedItems.retrait ? 'true' : 'false');
    formData.append('bail', checkedItems.bail ? 'true' : 'false');
    formData.append('devis', checkedItems.devis ? 'true' : 'false');
    formData.append('quitus', checkedItems.quitus ? 'true' : 'false');
    formData.append('etatdeslieux', checkedItems.etatdeslieux ? 'true' : 'false');

    // Ajoutez le fichier PDF s'il est sélectionné et devis est coché
    if (checkedItems.devis && file) {
      formData.append('devis_pdf', file);
    }

    // Vérification des données envoyées
    console.log("Contenu du formData :");
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    try {
      const response = await axios.post(`http://localhost:5000/api/operations`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Données envoyées :', {
        recensement: checkedItems.recensement,
        attribution: checkedItems.attribution,
        retrait: checkedItems.retrait,
        bail: checkedItems.bail,
        devis: checkedItems.devis,
        quitus: checkedItems.quitus,
        etatdeslieux: checkedItems.etatdeslieux,
      });
      console.log('Réponse du backend :', response.data);
      toast.success('Enregistrement réussi !', { autoClose: 60000 });

      // Fermez le modal après une seconde
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des données", error);
      toast.error('Erreur d\'enregistrement.', { autoClose: 60000 });

      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCheckedItems((prev) => ({ ...prev, [name]: checked }));
    if (name === 'devis' && !checked) {
      setFile(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 4,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '400px' },
        }}
      >
        <Box 
          sx={{
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '4px',
            display: 'inline-block',
            backgroundColor: '#d3b8a6',
          }}
        >
          <Typography align="center" style={{ fontSize: '14px', color: '#000000' }} mb={2}>
            {soa ? soa.nom : 'SOA inconnu'}
          </Typography>
        </Box>
        {Object.keys(checkedItems).map((key) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Checkbox
              name={key}
              checked={checkedItems[key as keyof typeof checkedItems]}
              onChange={handleChange}
              sx={{
                '&.Mui-checked': {
                  color: 'green',
                },
              }}
            />
            <label style={{ marginLeft: '8px' }}>{key}</label>
            {key === 'devis' && checkedItems.devis && (
              <>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <IconButton component="label" htmlFor="file-upload">
                  <AttachFileIcon />
                </IconButton>
              </>
            )}
          </div>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button
            variant="contained"
            color="error"
            onClick={onClose}
            sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' }, color: '#FFF' }}
          >
            Enregistrer
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default OperationModal;
