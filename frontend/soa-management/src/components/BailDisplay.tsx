import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';


interface Bail {
  id: number;
  entite: string;
  type_de_bail: string;
  beneficiaire: string;
  district: string;
  duree: number;
  date_d_effet: string;
  scan: string;
  fin: string;
}

const typeDeBailOptions = [
  'bureau',
  'bureau logement',
  'logement',
];

const districtOptions = [
  'Antsirabe I',
  'Antsirabe II',
  'Betafo',
  'Ambatolampy',
  'Antanifotsy',
  'Faratsiho',
  'Mandoto',
];

const BailDisplay: React.FC = () => {
  const [bails, setBails] = useState<Bail[]>([]);
  const [filteredBails, setFilteredBails] = useState(bails);
  const [open, setOpen] = useState(false);
  const [editingBail, setEditingBail] = useState<Bail | null>(null);
  const [form, setForm] = useState<Omit<Bail, 'id' | 'fin' | 'scan'>>({
    entite: '',
    type_de_bail: '',
    beneficiaire: '',
    district: '',
    duree: 1,
    date_d_effet: '',
  });
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [previewPDF, setPreviewPDF] = useState<string | null>(null); // Pour visualiser le PDF
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bailToDelete, setBailToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchBails();
  }, []);

  const fetchBails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/suivi_bail');
      setBails(response.data);
      setFilteredBails(response.data); // Initialise `filteredBails` avec les données récupérées
    } catch (error) {
      console.error('Erreur lors de la récupération des bails:', error);
    }
  };

  // Synchroniser `filteredBails` avec `bails` lorsque `bails` change
  useEffect(() => {
    setFilteredBails(bails);
  }, [bails]);

  const handleDeleteOpen = (id: number) => {
    setBailToDelete(id);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setBailToDelete(null);
    setConfirmDeleteOpen(false);
  };

  const handleDelete = async () => {
    if (bailToDelete !== null) {
      try {
        await axios.delete(`http://localhost:5000/api/suivi_bail/${bailToDelete}`);
        toast.success('Bail supprimé avec succès !');
        fetchBails();
      } catch (error) {
        toast.error('Erreur lors de la suppression du bail.');
      } finally {
        handleDeleteClose();
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  
    if (searchTerm === '') {
      // Si le champ de recherche est vide, réinitialisez `filteredBails` à la liste complète
      setFilteredBails(bails);
    } else {
      // Sinon, appliquez le filtre
      const filtered = bails.filter(bail => {
        return (
          bail.entite.toLowerCase().includes(searchTerm) ||
          bail.type_de_bail.toLowerCase().includes(searchTerm) ||
          bail.beneficiaire.toLowerCase().includes(searchTerm) ||
          bail.district.toLowerCase().includes(searchTerm) ||
          bail.duree.toString().includes(searchTerm) ||
          new Date(bail.date_d_effet).toLocaleDateString().includes(searchTerm) ||
          new Date(bail.fin).toLocaleDateString().includes(searchTerm)
        );
      });
      setFilteredBails(filtered);
    }
  };

  const handleEdit = (bail: Bail) => {
    setEditingBail(bail);
    setForm({
      entite: bail.entite,
      type_de_bail: bail.type_de_bail,
      beneficiaire: bail.beneficiaire,
      district: bail.district,
      duree: bail.duree,
      date_d_effet: bail.date_d_effet,
    });
    setOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScanFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('entite', form.entite);
      formData.append('type_de_bail', form.type_de_bail);
      formData.append('beneficiaire', form.beneficiaire);
      formData.append('district', form.district);
      formData.append('duree', form.duree.toString());
      formData.append('date_d_effet', form.date_d_effet);
      if (scanFile) formData.append('scan', scanFile);
  
      if (editingBail) {
        await axios.put(`http://localhost:5000/api/suivi_bail/${editingBail.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Bail modifié avec succès !');
      } else {
        await axios.post('http://localhost:5000/api/suivi_bail', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Bail ajouté avec succès !');
      }
      setOpen(false);
      fetchBails();
      setEditingBail(null); // Réinitialisez à nouveau après la soumission
      setForm({
        entite: '',
        type_de_bail: '',
        beneficiaire: '',
        district: '',
        duree: 0,
        date_d_effet: '',
      });
      setScanFile(null);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du bail.");
    }
  };

  const handlePreviewPDF = (bail: Bail) => {
    const pdfUrl = `http://localhost:5000/api/suivi_bail/${bail.id}/scan`;
    setPreviewPDF(pdfUrl);
  };

  const handleClosePreviewPDF = () => {
    setPreviewPDF(null);
  };
  
  return (
    <Container>
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center', marginTop: '20px' }}>
        Suivi Bail
      </Typography>
      <Button
        variant="contained"
        color="info"
        onClick={() => {
          setEditingBail(null); // Réinitialisez l'état d'édition avant d'ouvrir le modal
          setForm({
            entite: '',
            type_de_bail: '',
            beneficiaire: '',
            district: '',
            duree: 0,
            date_d_effet: '',
          });
          setScanFile(null); // Réinitialisez également le fichier scanné
          setOpen(true);
        }}
        style={{ marginBottom: '20px' }}
      >
      Ajouter
      </Button>
      <TextField
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={handleSearchChange}
        variant="outlined"
        size="small"
        sx={{ width: '300px', background: '#FFF', marginLeft: '753px' }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#000000'}}>
            <TableRow>
              <TableCell sx={{ color: '#FFFFFF' }}>Entité</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>Type de Bail</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>Bénéficiaire IM</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>District</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>Durée</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>Date d'Effet</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>Fin</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>Scan</TableCell>
              <TableCell sx={{ color: '#FFFFFF' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {filteredBails.map((bail) => (
            <TableRow key={bail.id}>
              <TableCell>{bail.entite}</TableCell>
              <TableCell>{bail.type_de_bail}</TableCell>
              <TableCell>{bail.beneficiaire}</TableCell>
              <TableCell>{bail.district}</TableCell>
              <TableCell>{bail.duree}</TableCell>
              <TableCell>{new Date(bail.date_d_effet).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(bail.fin).toLocaleDateString()}</TableCell>
              <TableCell>
                <IconButton color="default" onClick={() => handlePreviewPDF(bail)} sx={{ marginLeft: '11px' }}>
                  <Visibility />
                </IconButton>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(bail)} color='info'>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDeleteOpen(bail.id)} color="error">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>{editingBail ? 'Modifier' : 'Ajouter'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Entité"
            name="entite"
            value={form.entite}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          />
          <TextField
            select
            label="Type de Bail"
            name="type_de_bail"
            value={form.type_de_bail}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          >
            {typeDeBailOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Bénéficiaire"
            name="beneficiaire"
            value={form.beneficiaire}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          />
          <TextField
            select
            label="District"
            name="district"
            value={form.district}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          >
            {districtOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Durée"
            name="duree"
            type="number"
            value={form.duree}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Date d'Effet"
            name="date_d_effet"
            type="date"
            value={form.date_d_effet}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ marginTop: '15px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="error">
            Annuler
          </Button>
          <Button onClick={handleSubmit} color="success">
            {editingBail ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirmation de Suppression</DialogTitle>
          <DialogContent>
            Êtes-vous sûr de vouloir supprimer ce bail ?
          </DialogContent>
          <DialogActions>
          <Button onClick={handleDeleteClose} color="info">
              NON
            </Button>
            <Button onClick={handleDelete} color="error">
              OUI
            </Button>
          </DialogActions>
      </Dialog>

      <Dialog open={!!previewPDF} onClose={handleClosePreviewPDF} fullWidth maxWidth="md">
        <DialogTitle>Aperçu du scan</DialogTitle>
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

      <ToastContainer />
    </Container>
  );
};

export default BailDisplay;
