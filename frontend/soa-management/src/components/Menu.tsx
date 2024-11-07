// Menu.tsx
import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Dialog, DialogContent, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Close } from '@mui/icons-material'; // Icône pour fermer le modal
import OperationsDisplay from './OperationsDisplay'; // Import de votre composant d'affichage des opérations
import BailDisplay from './BailDisplay';
import './InfoSection.css'; // Assurez-vous que ce fichier est correctement importé

// Importez vos images
import photo15 from './pik/photo15.jpg';
import photo14 from './pik/photo14.jpg';
import photo13 from './pik/photo13.jpg';
import photo12 from './pik/photo12.jpg';
import photo11 from './pik/photo11.jpg';
import photo10 from './pik/photo10.jpg';
import photo9 from './pik/photo9.jpg';
import photo8 from './pik/photo8.jpg';
import photo7 from './pik/photo7.jpg';
import photo6 from './pik/photo6.jpg';
import photo5 from './pik/photo5.jpg';
import photo4 from './pik/photo4.jpg';
import photo3 from './pik/photo3.jpg';
import photo2 from './pik/photo2.jpg';
import photo1 from './pik/photo1.jpg';

const images = [
  photo15,
  photo14,
  photo13,
  photo12,
  photo11,
  photo10,
  photo9,
  photo8,
  photo7,
  photo6,
  photo5,
  photo4,
  photo3,
  photo2,
  photo1,
  // Ajoutez d'autres chemins d'images ici
];

const regions = ['Antsirabe I', 'Antsirabe II', 'Betafo', 'Ambatolampy', 'Antanifotsy', 'Faratsiho', 'Mandoto'];

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Pour obtenir la route actuelle
  const [currentImage, setCurrentImage] = useState(images[0]); // Image actuelle
  const [openModal, setOpenModal] = useState(false); // État pour gérer l'ouverture du modal
  const [modalContent, setModalContent] = useState<"operations" | "bail" | null>(null); // État pour le contenu du modal

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => {
        const currentIndex = images.indexOf(prevImage);
        const nextIndex = (currentIndex + 1) % images.length; // Boucle à l'image suivante
        return images[nextIndex];
      });
    }, 4000); // Change l'image toutes les 4 secondes

    return () => clearInterval(interval); // Nettoyer l'intervalle au démontage du composant
  }, []);

  const handleLogout = () => {
    // Supprime l'authentification
    localStorage.removeItem('auth');
    console.log('Déconnexion');
    navigate('/login'); // Redirection après la déconnexion vers la page d'authentification
  };

  const handleInfoSection = () => {
    navigate('/menu'); // Redirige vers la section InfoSection (par exemple, la page d'accueil)
  };

  const handleOpenModal = (content: "operations" | "bail") => {
    setModalContent(content); // Définir le contenu du modal
    setOpenModal(true); // Ouvrir le modal
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Fermer le modal
    setModalContent(null); // Réinitialiser le contenu du modal
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: '#F7E9DA', // Couleur de fond menu
          padding: '20px',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Ombre légère pour un design propre
          display: 'flex',
          justifyContent: 'space-between', // Pour gérer la disposition des éléments
          alignItems: 'center',
          position: 'fixed', // Position fixe
          top: 0, // Toujours en haut de l'écran
          left: 0, // S'étend sur toute la largeur
          right: 0, // S'étend sur toute la largeur
          zIndex: 1000, // Pour s'assurer qu'il est au-dessus des autres éléments
          height: '70px', // Hauteur du menu
        }}
      >
        {/* Bouton Accueil sur la gauche */}
        <Button
          variant="contained"
          sx={{ borderRadius: '8px', padding: '10px 20px', backgroundColor: '#F4A460' }}
          onClick={handleInfoSection}
        >
          Accueil
        </Button>

        {/* Section des boutons des régions */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap', // Pour gérer les petits écrans et éviter de dépasser les limites
            gap: 2,
          }}
        >
          {regions.map((region) => (
            <Button
              key={region}
              variant="contained"
              color="primary"
              sx={{ borderRadius: '8px', padding: '10px 20px' }}
              onClick={() => navigate(`/soa/${region}`)}
            >
              {region}
            </Button>
          ))}
        </Box>

        {/* Bouton de déconnexion */}
        <Button
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: '8px', padding: '10px 20px' }}
          onClick={handleLogout}
        >
          Déconnexion
        </Button>
      </Box>

      {/* Section d'information */}
      {location.pathname === '/menu' && (
        <Box
          className="info-section" // Utilisez la classe CSS pour appliquer les styles
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start', // Aligne les éléments en haut
            padding: '50px',
            height: 'calc(100vh - 70px)', // Ajuste la hauteur en fonction de la hauteur du menu
            marginTop: '25px', // Ajout d'une marge supérieure de 70px pour éviter la superposition avec le menu

          }}
        >
          <Box className="info-text" style={{ paddingTop: '80px' }}>
            <Typography variant="h6" className="info-title" style={{ fontSize: '3rem' }}>
              Logement et Bâtiment Administratif dans le région Vakinankaratra
            </Typography>

            <Typography variant="body2" className="info-description" style={{ fontSize: '1.2rem' }}>
            Cette application couvre tous les aspects de la gestion des bâtiments administratifs et des logements au sein de la région du Vakinankaratra, offrant une solution complète pour l'administration et la maintenance de ces infrastructures.
            </Typography>
            <Button
              variant="contained"
              sx={{ borderRadius: '8px', padding: '10px 20px', backgroundColor: '#F4A460', marginTop: '20px' }}
              onClick={() => handleOpenModal("operations")} // Ouvre le modal pour OperationsDisplay
            >
              Suivi Administratif
            </Button>
            <Button
              variant="contained"
              sx={{ borderRadius: '8px', padding: '10px 20px', backgroundColor: '#F4A460', marginTop: '20px', marginLeft: '40px' }}
              onClick={() => handleOpenModal("bail")} // Ouvre le modal pour BailDisplay
            >
              Suivi Bail
            </Button>
          </Box>
          <Box className="info-image">
            <img src={currentImage} alt="Bâtiment Administratif" style={{ maxWidth: '55%', height: 'auto', marginTop: '80px' }} />
          </Box>
        </Box>
      )}

      {/* Modal pour afficher l'interface des opérations */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullScreen // Le modal occupe tout l'écran
      >
        <DialogContent>
          {/* Bouton pour fermer le modal */}
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleCloseModal}
            aria-label="close"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
          
          {/* Contenu de l'interface des opérations */}
          {modalContent === "operations" && <OperationsDisplay />}
          {modalContent === "bail" && <BailDisplay />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Menu;
