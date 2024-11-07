import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, IconButton, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { Add, Edit, Delete, PhotoCamera, Visibility } from '@mui/icons-material';
import axios from 'axios';
import SoaModal from './SoaModal';
import OperationModal from './OperationModal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Soa {
  id: number;
  nom: string;
  commune_id: number;
  photo?: string; // Ajout du champ photo
}

const SoaList: React.FC<{ commune_id: number }> = ({ commune_id }) => {
  const [soaList, setSoaList] = useState<Soa[]>([]);
  const [filteredSoaList, setFilteredSoaList] = useState<Soa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSoa, setSelectedSoa] = useState<Soa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: number; open: boolean }>({ id: 0, open: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null); // Pour visualiser la photo

  useEffect(() => {
    const fetchSoaList = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/soa?commune_id=${commune_id}`);
        setSoaList(response.data);
        setFilteredSoaList(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };
    fetchSoaList();
  }, [commune_id]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filtered = soaList.filter(soa => soa.nom.toLowerCase().includes(searchTerm));
    setFilteredSoaList(filtered);
  };

  const handleUploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>, soa: Soa) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('photo', file);

      try {
        const response = await axios.post(`http://localhost:5000/api/soa/${soa.id}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updatedSoaList = soaList.map(item => item.id === soa.id ? { ...item, photo: response.data.photo } : item);
        setSoaList(updatedSoaList);
        setFilteredSoaList(updatedSoaList);
        toast.success('Photo téléchargée avec succès');
      } catch (error) {
        toast.error('Erreur lors du téléchargement de la photo');
      }
    }
  };

  const handlePreviewPhoto = (soa: Soa) => {
    if (soa.photo) {
      setPreviewPhoto(soa.photo);
    } else {
      toast.error('Aucune photo disponible pour ce SOA');
    }
  };

  const handleClosePreviewPhoto = () => {
    setPreviewPhoto(null);
  };

  const handleOpenModal = (soa?: Soa) => {
    setSelectedSoa(soa || null);
    setIsOperationModalOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenOperationModal = (soa: Soa) => {
    setSelectedSoa(soa);
    setIsModalOpen(false);
    setIsOperationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSoa(null);
  };

  const handleCloseOperationModal = () => {
    setIsOperationModalOpen(false);
    setSelectedSoa(null);
  };

  const handleSaveSoa = async (soaData: { nom: string; commune_id: number }) => {
    try {
      if (selectedSoa) {
        await axios.put(`http://localhost:5000/api/soa/${selectedSoa.id}`, soaData);
      } else {
        await axios.post('http://localhost:5000/api/soa', soaData);
      }
      setIsModalOpen(false);
      const response = await axios.get(`http://localhost:5000/api/soa?commune_id=${commune_id}`);
      setSoaList(response.data);
      setFilteredSoaList(response.data);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du SOA');
    }
  };

  const handleDeleteSoa = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/soa/${deleteConfirmation.id}`);
      toast.success('SOA supprimé avec succès');
      const response = await axios.get(`http://localhost:5000/api/soa?commune_id=${commune_id}`);
      setSoaList(response.data);
      setFilteredSoaList(response.data);
      setDeleteConfirmation({ id: 0, open: false });
    } catch (error) {
      toast.error('Erreur lors de la suppression du SOA');
    }
  };
  

  if (loading) return <Typography variant="h6">Chargement...</Typography>;
  if (error) return <Typography variant="h6" color="error">{error}</Typography>;

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingTop: '40px', paddingLeft: '20px', paddingRight: '20px' }}>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Ajouter SOA
        </Button>
        <Typography variant="h3" style={{ color: '#FFF' }}>Liste SOA</Typography>
        <TextField
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ width: '300px', background: '#FFF' }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 3,
          paddingRight: '20px',
          paddingLeft: '20px',
        }}
      >
        {filteredSoaList.map((soa) => (
          <Card key={soa.id} sx={{ background: '#F1F1F1', borderRadius: '8px' }}>
            <CardContent>
              <Button
                variant="contained"
                color="info"
                onClick={() => handleOpenOperationModal(soa)}
              >
                Gérer
              </Button>
              <IconButton color="default" onClick={() => handlePreviewPhoto(soa)} sx={{ marginLeft: '11px'}}>
                <Visibility />
              </IconButton>
              <Typography style={{ fontSize: '14px', color: '#000000' }} component="div" gutterBottom>
                {soa.nom}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id={`upload-photo-${soa.id}`}
                  type="file"
                  onChange={(e) => handleUploadPhoto(e, soa)}
                />
                <label htmlFor={`upload-photo-${soa.id}`}>
                  <IconButton color="default" component="span">
                    <PhotoCamera />
                  </IconButton>
                </label>

                <IconButton color="info" onClick={() => handleOpenModal(soa)}>
                  <Edit />
                </IconButton>

                <IconButton color="secondary" onClick={() => setDeleteConfirmation({ id: soa.id, open: true })}>
                  <Delete />
                </IconButton>

              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={Boolean(previewPhoto)} onClose={handleClosePreviewPhoto}>
        <DialogTitle>Photo</DialogTitle>
        {previewPhoto && <img src={`http://localhost:5000/uploads/${previewPhoto}`} alt="Photo du SOA" style={{ width: '100%' }} />}
        <DialogActions>
          <Button onClick={handleClosePreviewPhoto} color="error">Fermer</Button>
        </DialogActions>
      </Dialog>

      <SoaModal open={isModalOpen} onClose={handleCloseModal} soa={selectedSoa} onSave={handleSaveSoa} commune_id={commune_id} />
      <OperationModal soa={selectedSoa} open={isOperationModalOpen} onClose={handleCloseOperationModal} />

      <Dialog open={deleteConfirmation.open} onClose={() => setDeleteConfirmation({ id: 0, open: false })}>
        <DialogTitle>Voulez-vous vraiment supprimer ce SOA ?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmation({ id: 0, open: false })} color="info">Annuler</Button>
          <Button onClick={handleDeleteSoa} color="secondary">Supprimer</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default SoaList;
