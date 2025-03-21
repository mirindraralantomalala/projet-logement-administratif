import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  TextField,
  Button,
  IconButton,
  Modal,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";  // Import de l'icône pour la croix
import jsPDF from "jspdf";
import "jspdf-autotable";


const Retrait: React.FC = () => {
  // États
  const [checkedItems, setCheckedItems] = useState({
    demandemanuscrite : false,
    photocopieCIN: false,
    photocopiefichedepaie: false,
    acteformate: false,
    certificatderesidence: false,
    etatdeslieux: false,
    ca: false,
  });
  const [observation, setObservation] = useState<"complet" | "a fournir" | "rejeter">("a fournir");
  const [isSmallModalOpen, setSmallModalOpen] = useState(false);
  const [isLargeModalOpen, setLargeModalOpen] = useState(false);

  // Gestion des cases à cocher
  const handleCheckboxChange = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  
  // Gestion de la soumission
  const handleSubmit = () => {
    const allChecked = Object.values(checkedItems).every((value) => value === true);

    if (allChecked && observation === "complet") {
      setLargeModalOpen(true); // Ouvre le grand modal
    } else {
      setSmallModalOpen(true); // Ouvre le petit modal
    }
  };

  // Gestion de la fermeture des modales
  const handleCloseSmallModal = () => setSmallModalOpen(false);

  // Définir le type pour une ligne dans `rows`
type RowType = {
  titre: string;
  nomPropriete: string;
  adressePhysique: string;
  usage: string;
  nomPrenoms: string;
  im: string;
  fonction: string;
  refDecision: string;
  nbPiecesEtages: string;
  etatBatiment: string;
  observations: string;
};

// Définir le type pour formData
type FormDataType = {
  matricule: string;
  nom: string;
  prenoms: string;
  budget1: string;
  imputationbudgetaire1: string;
  gradeouemploi1: string;
  indice1: string;
  ob1: string;
  budget2: string;
  imputationbudgetaire2: string;
  gradeouemploi2: string;
  indice2: string;
  ob2: string;
  rows: RowType[];
};

const [formData, setFormData] = useState<FormDataType>({
  matricule: "",
  nom: "",
  prenoms: "",
  budget1: "",
  imputationbudgetaire1: "",
  gradeouemploi1: "",
  indice1: "",
  ob1: "",
  budget2: "",
  imputationbudgetaire2: "",
  gradeouemploi2: "",
  indice2: "",
  ob2: "",
  rows: [
    {
      titre: "",
      nomPropriete: "",
      adressePhysique: "",
      usage: "",
      nomPrenoms: "",
      im: "",
      fonction: "",
      refDecision: "",
      nbPiecesEtages: "",
      etatBatiment: "",
      observations: "",
    },
  ],
});

  const handleOpenLargeModal = () => setLargeModalOpen(true);
  const handleCloseLargeModal = () => setLargeModalOpen(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index?: number,
    field?: keyof RowType
  ) => {
    const { name, value } = e.target;
  
    if (index !== undefined && field) {
      // Mise à jour d'une ligne spécifique dans `rows`
      setFormData((prev) => {
        const updatedRows = [...prev.rows];
        updatedRows[index][field] = value;
        return { ...prev, rows: updatedRows };
      });
    } else {
      // Mise à jour des champs simples en dehors de `rows`
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
    
  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Partie 1 : En haut à gauche
    doc.setFontSize(10);
    doc.text(
      `MINISTERE DE L’ECONOMIE ET DES FINANCES\n----\nSECRETARIAT GENERAL\n----\nDIRECTION GENERALE DU BUDGET ET DES FINANCES\n----\nDIRECTION DU BUDGET\n----\nSERVICE REGIONAL DU BUDGET\nVAKINANKARATRA`,
      10,
      10
    );
  
    // Partie 2 : En haut à droite
  doc.text(
    `DECISION N°___-23 MEF/SG/DGBF/DB/SRB Vak. du\n\nPortant Retrait d’un Logement de fonction`,
    200, // Position x (bord droit du PDF)
    10, // Position y
    { align: 'right' } // Alignement du texte à droite
  );
  
    // Partie 3 : Matricule et Nom/Prénoms (en dessous de la partie 1 et 2)
    doc.text(
      `MATRICULE : ${formData.matricule}                                               Nom : ${formData.nom} \n\n                                                                            Prénoms : ${formData.prenoms} `,
      10,
      60
    );
  
    // Partie 4 : Tableau (en dessous de la partie 3)
const startY = 75; // Position de départ du tableau
const firstRowHeight = 40; // Hauteur personnalisée pour la première ligne
const secondRowHeight = 140; // Hauteur personnalisée pour la deuxième ligne

doc.setDrawColor(0);
doc.setLineWidth(0.5);

// Bordure principale du tableau (somme des hauteurs des lignes)
const totalHeight = firstRowHeight + secondRowHeight;
doc.rect(10, startY, 190, totalHeight); // Bordure principale

// Colonnes
doc.line(100, startY, 100, startY + totalHeight); // Ligne verticale pour diviser les colonnes

// Lignes horizontales pour séparer les lignes
doc.line(10, startY + firstRowHeight, 200, startY + firstRowHeight); // Ligne entre la 1ère et la 2ème ligne
doc.line(10, startY + firstRowHeight + secondRowHeight, 200, startY + firstRowHeight + secondRowHeight); // Ligne entre la 2ème et la 3ème ligne

// Contenu de la première ligne (Labels) - Aligné verticalement au centre
doc.text('ANCIENNE POSITION', 20, startY + firstRowHeight / 5 + 3); // Centrage vertical
doc.text('NOUVELLE POSITION', 110, startY + firstRowHeight / 5 + 3);
doc.text(`BUDGET : ${formData.budget1}`, 20, startY + firstRowHeight / 5 + 8);
doc.text(`IMPUTATION BUDGETAIRE : ${formData.imputationbudgetaire1}`, 20, startY + firstRowHeight / 5 + 14);
doc.text(`GRADE OU EMPLOI : ${formData.gradeouemploi1}`, 20, startY + firstRowHeight / 5 + 20);
doc.text(`INDICE : ${formData.indice1}`, 20, startY + firstRowHeight / 5 + 26);
doc.text(`BUDGET : ${formData.budget2}`, 110, startY + firstRowHeight / 5 + 8);
doc.text(`IMPUTATION BUDGETAIRE : ${formData.imputationbudgetaire2}`, 110, startY + firstRowHeight / 5 + 14);
doc.text(`GRADE OU EMPLOI : ${formData.gradeouemploi2}`, 110, startY + firstRowHeight / 5 + 20);
doc.text(`INDICE : ${formData.indice2}`, 110, startY + firstRowHeight / 5 + 26);

// Définir la largeur maximale de la cellule
const maxWidth = 80; // Vous pouvez ajuster la valeur en fonction de la taille de votre tableau

// Fonction pour gérer le texte avec retour à la ligne automatique
function wrapText(
  doc: any, // Type général pour le document (vous pouvez le spécifier plus précisément selon l'outil que vous utilisez)
  text: string, // Le texte à afficher
  x: number, // Position X de l'endroit où le texte doit commencer
  y: number, // Position Y de l'endroit où le texte doit commencer
  maxWidth: number // Largeur maximale de la cellule
): void {
  const words = text.split(' ');
  let line = '';
  let lineHeight = 10; // Hauteur de ligne
  let startX = x;

  words.forEach((word: string, index: number) => {
    const testLine = line + (line ? ' ' : '') + word;
    const testWidth = doc.getTextWidth(testLine);

    // Si le texte dépasse la largeur maximale, on passe à la ligne suivante
    if (testWidth > maxWidth) {
      doc.text(line, startX, y);
      line = word;
      y += lineHeight; // Décalage vers le bas pour la nouvelle ligne
    } else {
      line = testLine;
    }
  });

  // Afficher la dernière ligne restante
  if (line) {
    doc.text(line, startX, y);
  }
}

// Exemple pour afficher les valeurs dans la deuxième ligne
wrapText(doc, formData.ob1, 20, startY + firstRowHeight + secondRowHeight / 10 + 3, maxWidth);
wrapText(doc, formData.ob2, 110, startY + firstRowHeight + secondRowHeight / 10 + 3, maxWidth);

  
    // Partie 5 : Ampliation (en dessous du tableau, partie gauche)
    doc.text(
      `A compléter par les Direction, Service,\n District, Commune ou intéressé\nDATE DE NOTIFICATION:\nDATE DE DEPART:\nDATE D’ARRIVEE:\nDATE DE PRISE DE SERVICE:\nDATE:`,
      10,
      startY + 185
    );
    doc.text(
      `Ampliation:\n\n- SRB Vakinankaratra\n- SRSP Vakinankaratra\n- SLA\n- Archive`,
      100,
      startY + 185
    );
  
    // Partie 6 : Signature (à droite de la partie 5)
    doc.text('Signature :', 165, startY + 190);
  
    // Sauvegarder le fichier PDF
    doc.save('retrait.pdf');
  };
  


  return (
    <Box
      sx={{
        padding: 3,
        maxWidth: 800,
        margin: "auto",
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h4" textAlign="center" color="primary" gutterBottom>
        Dossier à Fournir
      </Typography>

      {/* Cases à cocher */}
      
      <Box>
        <Typography variant="h6">Pièces à fournir :</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
          <Checkbox
            checked={checkedItems.demandemanuscrite}
            onChange={() => handleCheckboxChange("demandemanuscrite")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Demande manuscrite adresser</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
          <Checkbox
            checked={checkedItems.photocopieCIN}
            onChange={() => handleCheckboxChange("photocopieCIN")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Photocopie CIN</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
          <Checkbox
            checked={checkedItems.photocopiefichedepaie}
            onChange={() => handleCheckboxChange("photocopiefichedepaie")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Photocopie dernier fiche de paie</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.acteformate}
            onChange={() => handleCheckboxChange("acteformate")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Acte formate</Typography>
        </Box>
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.certificatderesidence}
            onChange={() => handleCheckboxChange("certificatderesidence")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Certificat de residence</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.etatdeslieux}
            onChange={() => handleCheckboxChange("etatdeslieux")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Etat des lieux</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.ca}
            onChange={() => handleCheckboxChange("ca")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>C.A</Typography>
        </Box>

        </Box>
      

      {/* Formulaire d'observation */}
      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h6">Observation :</Typography>
        <TextField
          select
          SelectProps={{ native: true }}
          fullWidth
          value={observation}
          onChange={(e) =>
            setObservation(e.target.value as "complet" | "a fournir" | "rejeter")
          }
          sx={{ marginBottom: 3 }}
        >
          <option value="complet">Complet</option>
          <option value="a fournir">À fournir</option>
          <option value="rejeter">Rejeter</option>
        </TextField>
      </Box>

      {/* Bouton de validation */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmit}
        sx={{ marginBottom: 4 }}
      >
        Valider
      </Button>

      {/* Petit Modal */}
      <Modal open={isSmallModalOpen} onClose={handleCloseSmallModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: 3,
            backgroundColor: "#fff",
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" textAlign="center">
            Dossier incomplet !
          </Typography>
          <Typography textAlign="center" sx={{ marginTop: 2 }}>
            Veuillez vérifier les pièces à fournir.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 3 }}
            onClick={handleCloseSmallModal}
          >
            Fermer
          </Button>
        </Box>
      </Modal>

{/* Grand Modal */}
<Modal open={isLargeModalOpen} onClose={handleCloseLargeModal}>
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Box
      sx={{
        position: "relative",
        padding: 3,
        backgroundColor: "#fff",
        boxShadow: 24,
        borderRadius: 2,
        width: "90%",
        maxHeight: "90%",
        overflowY: "auto",
      }}
    >
      {/* Bouton de fermeture (croix) */}
      <IconButton
        onClick={handleCloseLargeModal}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          color: "black",
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h4" textAlign="center" mb={2}>
        Formulaire de retrait
      </Typography>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
  <label>
    Matricule
    <input
      type="text"
      name="matricule"
      placeholder="Matricule"
      value={formData.matricule}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
    Nom
    <input
      type="text"
      name="nom"
      placeholder="Nom"
      value={formData.nom}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
    Prénoms
    <input
      type="text"
      name="prenoms"
      placeholder="Prénoms"
      value={formData.prenoms}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
    </label>
<h2>Ancienne Position</h2>
<label>
    Budget
    <input
      type="text"
      name="budget1"
      placeholder="Budget"
      value={formData.budget1}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
    Imputation Budgetaire
    <input
      type="text"
      name="imputationbudgetaire1"
      placeholder="Imputation Budgetaire"
      value={formData.imputationbudgetaire1}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
    Grade ou Emploi
    <input
      type="text"
      name="gradeouemploi1"
      placeholder="Grade ou Emploi"
      value={formData.gradeouemploi1}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
    Indice
    <input
      type="text"
      name="indice1"
      placeholder="Indice"
      value={formData.indice1}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
  Obervations
  <textarea
    name="ob1"
    placeholder="Saisissez votre observation ici..."
    value={formData.ob1}
    onChange={handleChange}
    style={{
      width: "100%", // S'adapte à l'espace disponible
      height: "150px", // Hauteur plus grande pour ressembler à une zone de texte email
      padding: "10px", // Espace interne pour plus de confort
      boxSizing: "border-box", // Inclure bordure et padding dans les dimensions
      fontSize: "16px", // Texte lisible
      lineHeight: "1.5", // Espacement des lignes pour plus de lisibilité
      borderRadius: "5px", // Coins légèrement arrondis
      border: "1px solid #ccc", // Bordure fine et discrète
      outline: "none", // Supprime le contour bleu par défaut
      resize: "vertical", // Permet de redimensionner verticalement uniquement
    }}
  />
</label>

  <h2>Nouvelle Position</h2>
<label>
    Budget
    <input
      type="text"
      name="budget2"
      placeholder="Budget"
      value={formData.budget2}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
    Imputation Budgetaire
    <input
      type="text"
      name="imputationbudgetaire2"
      placeholder="Imputation Budgetaire"
      value={formData.imputationbudgetaire2}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
    Grade ou Emploi
    <input
      type="text"
      name="gradeouemploi2"
      placeholder="Grade ou Emploi"
      value={formData.gradeouemploi2}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
    Indice
    <input
      type="text"
      name="indice2"
      placeholder="Indice"
      value={formData.indice2}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
  Obervations
  <textarea
    name="ob2"
    placeholder="Saisissez votre observation ici..."
    value={formData.ob2}
    onChange={handleChange}
    style={{
      width: "100%", // S'adapte à l'espace disponible
      height: "150px", // Hauteur plus grande pour ressembler à une zone de texte email
      padding: "10px", // Espace interne pour plus de confort
      boxSizing: "border-box", // Inclure bordure et padding dans les dimensions
      fontSize: "16px", // Texte lisible
      lineHeight: "1.5", // Espacement des lignes pour plus de lisibilité
      borderRadius: "5px", // Coins légèrement arrondis
      border: "1px solid #ccc", // Bordure fine et discrète
      outline: "none", // Supprime le contour bleu par défaut
      resize: "vertical", // Permet de redimensionner verticalement uniquement
    }}
  />
</label>
  <button onClick={generatePDF} style={{ padding: "10px", marginTop: "10px" }}>
    Générer le PDF
  </button>
 
</div>

    </Box>
  </Box>
</Modal>


    </Box>
  );
};

export default Retrait;
