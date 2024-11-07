// SoaListWrapper.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import SoaList from './SoaList';

const SoaListWrapper: React.FC = () => {
  const { region } = useParams<{ region: string }>(); // Récupère le paramètre region depuis l'URL

  // Map des régions à leurs ID respectifs
  const commune_idMap: { [key: string]: number } = {
    'Antsirabe I': 1,
    'Antsirabe II': 2,
    'Betafo': 3,
    'Ambatolampy': 4,
    'Antanifotsy': 5,
    'Faratsiho': 6,
    'Mandoto': 7,
  };

  const commune_id = region ? commune_idMap[region] : undefined;

  // Assurez-vous que le paramètre communeId existe avant de rendre SoaList
  return commune_id ? <SoaList commune_id={commune_id} /> : <div>Région non trouvée</div>;
};

export default SoaListWrapper;
