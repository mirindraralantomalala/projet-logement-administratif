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


const Recensement: React.FC = () => {
  // États
  const [checkedItems, setCheckedItems] = useState({
    demandemanuscrite : false,
    ficheRecensement: false,
    planTopographie: false,
    certificatSituation: false,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [observation, setObservation] = useState<"complet" | "a fournir" | "rejeter">("a fournir");
  const [isSmallModalOpen, setSmallModalOpen] = useState(false);
  const [isLargeModalOpen, setLargeModalOpen] = useState(false);
  const [isVeryLargeModalOpen, setVeryLargeModalOpen] = useState(false);

  // Gestion des cases à cocher
  const handleCheckboxChange = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Gestion du fichier uploadé
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
  
      try {
        const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          const result = await response.json();
          console.log("File uploaded successfully:", result);
          setUploadedFile(file); // Met à jour l'état local pour afficher le nom du fichier
        } else {
          console.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
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

  // Gestion de la soumission
  const handleSubmitrecensement = () => {
    setVeryLargeModalOpen(true); // Ouvre le tres grand modal
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
  soa: string;
  nomduproprieter: string;
  numeroproprieter: string;
  ministere: string;
  direction: string;
  surface: string;
  district: string;
  commune: string;
  rows: RowType[];
};

const [formData, setFormData] = useState<FormDataType>({
  soa: "",
  nomduproprieter: "",
  numeroproprieter: "",
  ministere: "",
  direction: "",
  surface: "",
  district: "",
  commune: "",
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
  const handleCloseVeryLargeModal = () => setVeryLargeModalOpen(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

  const addRow = () => {
    setFormData({
      ...formData,
      rows: [
        ...formData.rows,
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
  };


  const generatePDFrecensement = () => {
    const doc = new jsPDF();
  
    // Texte en haut, centré
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(
      "REPOBLIKAN’I MADAGASIKARA\nFitiavana – Tanindrazana – Fandrosoana",
      doc.internal.pageSize.getWidth() / 2,
      10,
      { align: "center" }
    );
    doc.text("--------------------------------", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
  
    // Partie à gauche (Ministère, direction, etc.)
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    let yOffset = 30;
    doc.text(`${formData.ministere.toUpperCase()}`, 10, yOffset);
    doc.text(`${formData.direction.toUpperCase()}`, 10, yOffset + 20);
  
    // Partie à droite (District, commune)
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(`DISTRICT ${formData.district.toUpperCase()}`, doc.internal.pageSize.getWidth() - 80, yOffset + 10);
    doc.text(`COMMUNE ${formData.commune.toUpperCase()}`, doc.internal.pageSize.getWidth() - 80, yOffset + 20);
  
    // Ajouter un espace pour le tableau
    yOffset += 30;

    // Partie au centre (Titre principal)
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text(
      "FICHE DE RECENSEMENT DES BATIMENTS ET LOGEMENT\nADMINISTRATIFS",
      doc.internal.pageSize.getWidth() / 2,
      yOffset + 20,
      { align: "center" }
    );

    // Ajouter un espace pour le tableau
    yOffset += 30;
  
    // Labels du tableau
const columns = [
  { title: "Titre (1)", dataKey: "titre" },
  { title: "Nom de la propriété (2)", dataKey: "nomPropriete" },
  { title: "Adresse physique (3)", dataKey: "adressePhysique" },
  { title: "Usage (4)", dataKey: "usage" },
  { title: "Nom et Prénoms", dataKey: "nomPrenoms" },
  { title: "IM", dataKey: "im" },
  { title: "Fonction", dataKey: "fonction" },
  { title: "Réf. Décision", dataKey: "refDecision" },
  { title: "Nombre de pièces (6)", dataKey: "nbPiecesEtages" },
  { title: "État de la bâtisse (7)", dataKey: "etatBatiment" },
  { title: "Observations (8)", dataKey: "observations" },
];

// Extraction des données des rows
const rows = formData.rows.map((row) => ({
  titre: row.titre,
  nomPropriete: row.nomPropriete,
  adressePhysique: row.adressePhysique,
  usage: row.usage,
  nomPrenoms: row.nomPrenoms,
  im: row.im,
  fonction: row.fonction,
  refDecision: row.refDecision,
  nbPiecesEtages: row.nbPiecesEtages,
  etatBatiment: row.etatBatiment,
  observations: row.observations,
}));

// Ajouter le tableau
doc.autoTable({
  startY: yOffset,
  head: [
    [
      { content: "Titre (1)", rowSpan: 2 },
      { content: "Nom de la propriété (2)", rowSpan: 2 },
      { content: "Adresse physique (3)", rowSpan: 2 },
      { content: "Usage (4)", rowSpan: 2 },
      { content: "OCCUPANTS (cas de logement administratif) (5)", colSpan: 4 },
      { content: "Nombre de pièces (6)", rowSpan: 2 },
      { content: "État de la bâtisse (7)", rowSpan: 2 },
      { content: "Observations (8)", rowSpan: 2 },
    ],
    [
      "Nom et Prénoms",
      "IM",
      "Fonction",
      "Réf. Décision",
    ],
  ],
  body: rows.map((row) => [
    row.titre,
    row.nomPropriete,
    row.adressePhysique,
    row.usage,
    row.nomPrenoms,
    row.im,
    row.fonction,
    row.refDecision,
    row.nbPiecesEtages,
    row.etatBatiment,
    row.observations,
  ]),
  styles: { fontSize: 10 },
  headStyles: { fillColor: [200, 200, 200] },
});

  
    // Descendre sous le tableau
    const previousTable = (doc as any).lastAutoTable; // Cast vers `any` pour accéder à `lastAutoTable`
yOffset = previousTable ? previousTable.finalY + 10 : yOffset + 10;
  
    // Texte explicatif en bas du tableau
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(
      "(1) Si le terrain est déjà titré (2), Le nom inscrit sur le titre, (3) Adresse du bâtiment ou du terrain,\n" +
        "(4) Bureau ou logement ou autres, (5) informations complètes sur les occupants,\n" +
        "(6) exemple 11 Pièces et 2 Étages, (7) BE : Bon État / ME : Moyen État / MvE : Mauvais État.",
      10,
      yOffset
    );
  
    // Ajouter le texte final (responsable logistique et date)
    yOffset += 20;
    doc.setFont("times", "normal");
    doc.text("Le responsable de la logistique", 10, yOffset);
    doc.text(`Antsirabe, le `, doc.internal.pageSize.getWidth() - 80, yOffset);
  
    // Sauvegarder le fichier PDF
    doc.save("fiche de recensement.pdf");
  };


  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Initialisation du document PDF
  doc.setFontSize(14);
  doc.setFont("times", "bold");

  // Texte aligné à gauche
  doc.text("SECRETARIAT GENERAL", 10, 10);
  doc.text("--------------------------------", 10, 15);

  // Texte suivant
  doc.text("DIRECTION GENERAL DU BUDGET ET DES FINANCES", 10, 25);
  doc.text("--------------------------------", 10, 30);

  // Texte suivant
  doc.text("DIRECTION DU BUDGET", 10, 40);
  doc.text("--------------------------------", 10, 45);

  // Texte suivant
  doc.text("Service Régional du Budget Vakinankaratra", 10, 55);

  // Texte suivant
  doc.text("N°       - 2024/MEF/SG/DGBF/DB/SRB", 10, 70);

  // Partie au centre (Titre principal)
let yOffset = 100; // Position verticale de départ
doc.setFontSize(12);
doc.setFont("times", "bold");
doc.text(
  "QUITUS",
  doc.internal.pageSize.getWidth() / 2,
  yOffset,
  { align: "center" }
);

// Préparation et ajout du paragraphe principal
doc.setFontSize(10);
doc.setFont("times", "normal");

// Texte combiné avec interpolation des données
const paragraphText = `
Le Chef de Service Régional du Budget Vakinankaratra atteste que ${formData.soa}, a déposé le dossier de recensement des logements et bâtiments administratifs relevant de la propriété dite "${formData.nomduproprieter}", portant le titre N°${formData.numeroproprieter}, d’une contenance de ${formData.surface}, appartenant à l’Etat Malagasy, sise à Antsirabe Ville.

Le présent quitus lui est délivré pour servir et valoir ce que de droit.
`;

// Définir les dimensions et marges pour le texte
const pageWidth = doc.internal.pageSize.getWidth(); // Largeur de la page
const marginLeft = 20; // Marge gauche
const textWidth = pageWidth - marginLeft * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 20; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragraphText.trim(), marginLeft, yOffset, {
  maxWidth: textWidth,
  align: "justify", // Justifier le texte
});

// Définir les dimensions pour le bas de la page
const pageHeight = doc.internal.pageSize.getHeight(); // Hauteur de la page
const marginBottom = 20; // Marge basse
const marginRight = 10; // Marge droite

// Remonter la signature de 7 cm (70 points)
const offset = 70; // Décalage en points pour remonter la signature
const yPosition = pageHeight - marginBottom - offset; // Nouvelle position verticale

// Ajouter le texte de la signature
doc.setFontSize(10);
doc.setFont("times", "normal");
doc.text(`Antsirabe, le`, pageWidth - marginRight - 80, yPosition - 10); // Date
doc.text(
  `Le Chef de Service Régional du Budget\nVakinankaratra`,
  pageWidth - marginRight - 80,
  yPosition
); // Signature
  
  
    // Sauvegarder le fichier PDF
    doc.save("quitus.pdf");
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
            checked={checkedItems.ficheRecensement}
            onChange={() => handleCheckboxChange("ficheRecensement")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Fiche de recensement</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
          <Checkbox
            checked={checkedItems.planTopographie}
            onChange={() => handleCheckboxChange("planTopographie")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Plan topographie</Typography>
          <IconButton component="label">
            <AttachFileIcon />
            <input type="file" hidden accept="application/pdf" onChange={handleFileUpload} />
          </IconButton>
          {uploadedFile && <Typography>{uploadedFile.name}</Typography>}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.certificatSituation}
            onChange={() => handleCheckboxChange("certificatSituation")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Certificat de situation juridique</Typography>
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
        Quitus logement
      </Typography>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
  <div>
  <label htmlFor="soa">SOA : </label>
  <select
    id="soa"
    name="soa"
    value={formData.soa}
    onChange={handleChange}
  >
    <option value="SECRETARIAT PERMANENT REGIONAL (CER) VAKINANKARATRA">SECRETARIAT PERMANENT REGIONAL (CER) VAKINANKARATRA</option>
  <option value="ANTENNE (CED) AMBATOLAMPY">ANTENNE (CED) AMBATOLAMPY</option>
  <option value="ANTENNE (CED) ANTANIFOTSY">ANTENNE (CED) ANTANIFOTSY</option>
  <option value="ANTENNE (CED) ANTSIRABE I">ANTENNE (CED) ANTSIRABE I</option>
  <option value="ANTENNE (CED) ANTSIRABE II">ANTENNE (CED) ANTSIRABE II</option>
  <option value="ANTENNE (CED) BETAFO">ANTENNE (CED) BETAFO</option>
  <option value="ANTENNE (CED) FARATSIHO">ANTENNE (CED) FARATSIHO</option>
  <option value="ANTENNE (CED) MANDOTO">ANTENNE (CED) MANDOTO</option>
  <option value="ACADEMIE MILITAIRE D'ANTSIRABE">ACADEMIE MILITAIRE D'ANTSIRABE</option>
  <option value="ECOLE NATIONALE DES SOUS OFFICIERS DE L'ARMEE">ECOLE NATIONALE DES SOUS OFFICIERS DE L'ARMEE</option>
  <option value="DELEGATION MILITAIRE REGIONALE (DMR) VAKINAKARATRA">DELEGATION MILITAIRE REGIONALE (DMR) VAKINAKARATRA</option>
  <option value="GROUPEMENT DE LA GN VAKINANKARATRA">GROUPEMENT DE LA GN VAKINANKARATRA</option>
  <option value="SECRETARIAT GENERAL DE LA PREFECTURE D'ANTSIRABE I">SECRETARIAT GENERAL DE LA PREFECTURE D'ANTSIRABE I</option>
  <option value="PREFECTURE D'ANTSIRABE I">PREFECTURE D'ANTSIRABE I</option>
  <option value="PERSONNE RESPONSABLE DES MARCHES PUBLICS">PERSONNE RESPONSABLE DES MARCHES PUBLICS</option>
  <option value="DISTRICT D'AMBATOLAMPY">DISTRICT D'AMBATOLAMPY</option>
  <option value="DISTRICT D'ANTANIFOTSY">DISTRICT D'ANTANIFOTSY</option>
  <option value="DISTRICT ANTSIRABE I">DISTRICT ANTSIRABE I</option>
  <option value="DISTRICT ANTSIRABE II">DISTRICT ANTSIRABE II</option>
  <option value="DISTRICT DE BETAFO">DISTRICT DE BETAFO</option>
  <option value="DISTRICT DE MANDOTO">DISTRICT DE MANDOTO</option>
  <option value="DISTRICT DE FARATSIHO">DISTRICT DE FARATSIHO</option>
  <option value="DIRECTION REGIONALE DE LA SECURITE PUBLIQUE DE VAKINANKARATRA">DIRECTION REGIONALE DE LA SECURITE PUBLIQUE DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L'ADMINISTRATION PENITENTIAIRE VAKINANKARATRA">DIRECTION REGIONALE DE L'ADMINISTRATION PENITENTIAIRE VAKINANKARATRA</option>
  <option value="TRIBUNAL PREMIERE INSTANCE AMBATOLAMPY">TRIBUNAL PREMIERE INSTANCE AMBATOLAMPY</option>
  <option value="TRIBUNAL PREMIERE INSTANCE ANTSIRABE">TRIBUNAL PREMIERE INSTANCE ANTSIRABE</option>
  <option value="SERVICE REGIONAL DES ETUDES ET DE LA PROGRAMMATION VAKINANKARATRA">SERVICE REGIONAL DES ETUDES ET DE LA PROGRAMMATION VAKINANKARATRA</option>
  <option value="COMMISSION REGIONALE DES MARCHES VAKINANKARATRA">COMMISSION REGIONALE DES MARCHES VAKINANKARATRA</option>
  <option value="TRESORERIE GENERALE VAKINANKARATRA">TRESORERIE GENERALE VAKINANKARATRA</option>
  <option value="PP AMBATOLAMPY">PP AMBATOLAMPY</option>
  <option value="PP ANTANIFOTSY">PP ANTANIFOTSY</option>
  <option value="PP BETAFO">PP BETAFO</option>
  <option value="PP FARATSIHO">PP FARATSIHO</option>
  <option value="SECOURS AU DECES DES AGENTS FINANCES VAKINAKARATRA">SECOURS AU DECES DES AGENTS FINANCES VAKINAKARATRA</option>
  <option value="SERVICE REGIONAL DU BUDGET VAKINANKARATRA">SERVICE REGIONAL DU BUDGET VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA SOLDE ET DES PENSIONS VAKINANKARATRA">SERVICE REGIONAL DE LA SOLDE ET DES PENSIONS VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DES IMPÔTS VAKINANKARATRA">DIRECTION REGIONALE DES IMPÔTS VAKINANKARATRA</option>
  <option value="RECETTES DES DOUANES ANTSIRABE">RECETTES DES DOUANES ANTSIRABE</option>
  <option value="DELEGATION RÉGIONALE DU CONTRÔLE FINANCIER VAKINANKARATRA">DELEGATION RÉGIONALE DU CONTRÔLE FINANCIER VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE L'ECONOMIE ET DU PLAN VAKINANKARATRA">SERVICE REGIONAL DE L'ECONOMIE ET DU PLAN VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DU TRAVAIL ET DES LOIS SOCIALES VAKINANKARATRA">SERVICE REGIONAL DU TRAVAIL ET DES LOIS SOCIALES VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DU TRAVAIL VAKINANKARATRA">SERVICE REGIONAL DU TRAVAIL VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DU TRAVAIL, DE L'EMPLOI, DE LA FONCTION PUBLIQUE, ET DES LOIS SOCIALES VAKINANKARATRA">DIRECTION REGIONALE DU TRAVAIL, DE L'EMPLOI, DE LA FONCTION PUBLIQUE, ET DES LOIS SOCIALES VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA FONCTION PUBLIQUE VAKINANKARATRA">SERVICE REGIONAL DE LA FONCTION PUBLIQUE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DU TRAVAIL, DE L'EMPLOI ET DE LA FONCTION PUBLIQUE VAKINANKARATRA">DIRECTION REGIONALE DU TRAVAIL, DE L'EMPLOI ET DE LA FONCTION PUBLIQUE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA FONCTION PUBLIQUE VAKINANKARATRA">SERVICE REGIONAL DE LA FONCTION PUBLIQUE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE L'EMPLOI VAKINANKARATRA">SERVICE REGIONAL DE L'EMPLOI VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DU TOURISME ET DE L'ARTISANAT DE VAKINANKARATRA">DIRECTION REGIONALE DU TOURISME ET DE L'ARTISANAT DE VAKINANKARATRA</option>
  <option value="DIRECTION INTERREGIONALE DU TOURISME AMORON'I MANIA-VAKINANKARATRA">DIRECTION INTERREGIONALE DU TOURISME AMORON'I MANIA-VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE VAKINANKARATRA">DIRECTION REGIONALE DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L’ARTISANAT ET DES METIERS DE VAKINANKARATRA">DIRECTION REGIONALE DE L’ARTISANAT ET DES METIERS DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L’INDUSTRIALISATION, DU COMMERCE ET DE LA CONSOMMATION (DRICC) DE VAKINANKARATRA">DIRECTION REGIONALE DE L’INDUSTRIALISATION, DU COMMERCE ET DE LA CONSOMMATION (DRICC) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L’INDUSTRIALISATION ET DU COMMERCE (DRIC) DE VAKINANKARATRA">DIRECTION REGIONALE DE L’INDUSTRIALISATION ET DU COMMERCE (DRIC) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L'ENVIRONNEMENT ET DU DEVELOPPEMENT DURABLE (DREDD) VAKINANKARATRA">DIRECTION REGIONALE DE L'ENVIRONNEMENT ET DU DEVELOPPEMENT DURABLE (DREDD) VAKINANKARATRA</option>
  <option value="DIRECTIONS REGIONALES DE L'AGRICULTURE ET DE L’ELEVAGE (DRAE) VAKINANKARATRA">DIRECTIONS REGIONALES DE L'AGRICULTURE ET DE L’ELEVAGE (DRAE) VAKINANKARATRA</option>
  <option value="DIRECTIONS REGIONALES DE LA PÊCHE ET DE L’ÉCONOMIE BLEUE (DRPEB) VAKINANKARATRA">DIRECTIONS REGIONALES DE LA PÊCHE ET DE L’ÉCONOMIE BLEUE (DRPEB) VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DES AFFAIRES ADMINISTRATIVES ET FINANCIERES (SRAAF) VAKINANKARATRA">SERVICE REGIONAL DES AFFAIRES ADMINISTRATIVES ET FINANCIERES (SRAAF) VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA PÊCHE ET DE L’AQUACULTURE (SRPA) VAKINANKARATRA">SERVICE REGIONAL DE LA PÊCHE ET DE L’AQUACULTURE (SRPA) VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE L’ECONOMIE BLEUE (SREB) VAKINANKARATRA">SERVICE REGIONAL DE L’ECONOMIE BLEUE (SREB) VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DU SYSTEME D’INFORMATION, DE LA STATISTIQUE ET DU SUIVI-EVALUATION (SRSISSE) VAKINANKARATRA">SERVICE REGIONAL DU SYSTEME D’INFORMATION, DE LA STATISTIQUE ET DU SUIVI-EVALUATION (SRSISSE) VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L'EAU, DE L'ASSAINISSEMENT ET DE L'HYGIENE (DREAH) VAKINANKARATRA">DIRECTION REGIONALE DE L'EAU, DE L'ASSAINISSEMENT ET DE L'HYGIENE (DREAH) VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE VAKINANKARATRA">DIRECTION REGIONALE VAKINANKARATRA</option>
  <option value="DELEGATIONS LOCALES DES NOUVELLES VILLES ET DE L’HABITAT (DLNVH) DE VAKINANKARATRA">DELEGATIONS LOCALES DES NOUVELLES VILLES ET DE L’HABITAT (DLNVH) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DES TRAVAUX PUBLICS DE VAKINANKARATRA">DIRECTION REGIONALE DES TRAVAUX PUBLICS DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DES TRANSPORTS ET DE LA METEOROLOGIE (DRTM) DE VAKINANKARATRA">DIRECTION REGIONALE DES TRANSPORTS ET DE LA METEOROLOGIE (DRTM) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DES TRANSPORTS (SRT) DE VAKINANKARATRA">SERVICE REGIONAL DES TRANSPORTS (SRT) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONALE DE LA METEOROLOGIE (SRM) DE VAKINANKARATRA">SERVICE REGIONALE DE LA METEOROLOGIE (SRM) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DES DOMAINES (SRD) DE VAKINANKARATRA">SERVICE REGIONAL DES DOMAINES (SRD) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL TOPOGRAPHIQUE (SRTOPO) DE VAKINANKARATRA">SERVICE REGIONAL TOPOGRAPHIQUE (SRTOPO) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L’AMENAGEMENT DU TERRITOIRE ET DES SERVICES FONCIERS (DRATSF) DE VAKINANKARATRA">DIRECTION REGIONALE DE L’AMENAGEMENT DU TERRITOIRE ET DES SERVICES FONCIERS (DRATSF) DE VAKINANKARATRA</option>
  <option value="Direction Régionale de la Décentralisation, de l'Aménagement du Territoire et des Services Fonciers (DRDATSF) DE VAKINANKARATRA">Direction Régionale de la Décentralisation, de l'Aménagement du Territoire et des Services Fonciers (DRDATSF) DE VAKINANKARATRA</option>
  <option value="Service Régional de la Décentralisation et de l'Aménagement du Territoire (SRDAT) DE VAKINANKARATRA">Service Régional de la Décentralisation et de l'Aménagement du Territoire (SRDAT) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE L’AMENAGEMENT DU TERRITOIRE (SRAT) DE VAKINANKARATRA">SERVICE REGIONAL DE L’AMENAGEMENT DU TERRITOIRE (SRAT) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA DECENTRALISATION, DE L’AMENAGEMENT DU TERRITOIRE (SRDAT) DE VAKINANKARATRA">SERVICE REGIONAL DE LA DECENTRALISATION, DE L’AMENAGEMENT DU TERRITOIRE (SRDAT) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE LA SANTE PUBLIQUE (DRSP) VAKINANKARATRA">DIRECTION REGIONALE DE LA SANTE PUBLIQUE (DRSP) VAKINANKARATRA</option>
  <option value="CELLULE DE SUIVI ET D'EVALUATION DES PERFORMANCES (CSEP) VAKINANKARATRA">CELLULE DE SUIVI ET D'EVALUATION DES PERFORMANCES (CSEP) VAKINANKARATRA</option>
  <option value="SERVICE MEDICO SANITAIRE (SMSan) VAKINANKARATRA">SERVICE MEDICO SANITAIRE (SMSan) VAKINANKARATRA</option>
  <option value="SERVICE DE LA MAINTENANCE, DU GENIE SANITAIRE ET DE SANTE ENVIRONNEMENT (SMGSSE) VAKINANKARATRA">SERVICE DE LA MAINTENANCE, DU GENIE SANITAIRE ET DE SANTE ENVIRONNEMENT (SMGSSE) VAKINANKARATRA</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE REGIONALE (CHRR) VAKINANKARATRA">CENTRE HOSPITALIER DE REFERENCE REGIONALE (CHRR) VAKINANKARATRA</option>
  <option value="SERVICE DU CONTENTIEUX ET DU PATRIMOINE (SCP) VAKINANKARATRA">SERVICE DU CONTENTIEUX ET DU PATRIMOINE (SCP) VAKINANKARATRA</option>
  <option value="PERSONNE RESPONSABLE DES MARCHES PUBLICS (PRMP) VAKINANKARATRA">PERSONNE RESPONSABLE DES MARCHES PUBLICS (PRMP) VAKINANKARATRA</option>
  <option value="UNITE MEDICO- SOCIALE REGIONALE (UMSR) VAKINANKARATRA">UNITE MEDICO- SOCIALE REGIONALE (UMSR) VAKINANKARATRA</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) AMBATOLAMPY">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) AMBATOLAMPY</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTANIFOTSY">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTANIFOTSY</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTSIRABE I">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTSIRABE I</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTSIRABE II">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTSIRABE II</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) BETAFO">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) BETAFO</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) FARATSIHO">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) FARATSIHO</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) MANDOTO">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) MANDOTO</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) AMBATOLAMPY">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) AMBATOLAMPY</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) ANTANIFOTSY">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) ANTANIFOTSY</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) BETAFO">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) BETAFO</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) FARATSIHO">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) FARATSIHO</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) ANDRANOMANELATRA">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) ANDRANOMANELATRA</option>
  <option value="CENTRE DE REEDUCATION MOTRICE DE MADAGASCAR (CRMM) D'ANTSIRABE">CENTRE DE REEDUCATION MOTRICE DE MADAGASCAR (CRMM) D'ANTSIRABE</option>
  <option value="CENTRE NATIONAL DE CRENOTHERAPIE ET DE THERMOCLIMATISME (CNCT) D'ANTSIRABE">CENTRE NATIONAL DE CRENOTHERAPIE ET DE THERMOCLIMATISME (CNCT) D'ANTSIRABE</option>
  <option value="DIRECTION REGIONALE DE LA JEUNESSE ET DES SPORTS (DRJS) VAKINANKARATRA">DIRECTION REGIONALE DE LA JEUNESSE ET DES SPORTS (DRJS) VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE LA POPULATION ET DES SOLIDARITES / VAKINANKARATRA">DIRECTION REGIONALE DE LA POPULATION ET DES SOLIDARITES / VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE LA POPULATION, DE LA PROTECTION SOCIALE ET DE LA PROMOTION DE LA FEMME / VAKINANKARATRA">DIRECTION REGIONALE DE LA POPULATION, DE LA PROTECTION SOCIALE ET DE LA PROMOTION DE LA FEMME / VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L'EDUCATION NATIONALE VAKINANKARATRA">DIRECTION REGIONALE DE L'EDUCATION NATIONALE VAKINANKARATRA</option>
  <option value="CISCO AMBATOLAMPY">CISCO AMBATOLAMPY</option>
  <option value="CISCO ANTANIFOTSY">CISCO ANTANIFOTSY</option>
  <option value="CISCO ANTSIRABE I">CISCO ANTSIRABE I</option>
  <option value="CISCO ANTSIRABE II">CISCO ANTSIRABE II</option>
  <option value="CISCO BETAFO">CISCO BETAFO</option>
  <option value="CISCO FARATSIHO">CISCO FARATSIHO</option>
  <option value="CISCO MANDOTO">CISCO MANDOTO</option>
  <option value="ZAP AMBATOLAMPY">ZAP AMBATOLAMPY</option>
  <option value="ZAP ANTANIFOTSY">ZAP ANTANIFOTSY</option>
  <option value="ZAP ANTSIRABE I">ZAP ANTSIRABE I</option>
  <option value="ZAP ANTSIRABE II">ZAP ANTSIRABE II</option>
  <option value="ZAP BETAFO">ZAP BETAFO</option>
  <option value="ZAP FARATSIHO">ZAP FARATSIHO</option>
  <option value="ZAP MANDOTO">ZAP MANDOTO</option>
  <option value="SERVICE DE LA COORDINATION DE LA FORMATION ET DE L'APPRENTISSAGE VAKINANKARATRA">SERVICE DE LA COORDINATION DE LA FORMATION ET DE L'APPRENTISSAGE VAKINANKARATRA</option>
    <option value="SERVICE DE L'INGENERIE DE FORMATION ET PEDAGOGIQUE VAKINANKARATRA">SERVICE DE L'INGENERIE DE FORMATION ET PEDAGOGIQUE VAKINANKARATRA</option>
    <option value="SERVICE DE L'EVALUATION DES ACQUIS VAKINANKARATRA">SERVICE DE L'EVALUATION DES ACQUIS VAKINANKARATRA</option>
    <option value="SERVICE D'INFORMATION ET D'ORIENTATION VAKINANKARATRA">SERVICE D'INFORMATION ET D'ORIENTATION VAKINANKARATRA</option>
    <option value="SERVICE DE L'INGENIERIE DE FORMATION PEDAGOGIQUE VAKINANKARATRA">SERVICE DE L'INGENIERIE DE FORMATION PEDAGOGIQUE VAKINANKARATRA</option>
    <option value="SERVICE ADMINISTRATIF ET FINANCIER VAKINANKARATRA">SERVICE ADMINISTRATIF ET FINANCIER VAKINANKARATRA</option>
    <option value="DIRECTION RÉGIONALE DE L’ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE VAKINANKARATRA">DIRECTION RÉGIONALE DE L’ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE VAKINANKARATRA</option>
    <option value="SERVICE DES AFFAIRES ADMINISTRATIVES ET FINANCIÈRES VAKINANKARATRA">SERVICE DES AFFAIRES ADMINISTRATIVES ET FINANCIÈRES VAKINANKARATRA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE ANTSIRABE">CENTRE DE FORMATION PROFESSIONNELLE ANTSIRABE</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE AMBOHIBARY SAMBAINA">CENTRE DE FORMATION PROFESSIONNELLE AMBOHIBARY SAMBAINA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE ANTSOANTANY">CENTRE DE FORMATION PROFESSIONNELLE ANTSOANTANY</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE MANANDONA">CENTRE DE FORMATION PROFESSIONNELLE MANANDONA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE ANKAZOMIRIOTRA">CENTRE DE FORMATION PROFESSIONNELLE ANKAZOMIRIOTRA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE MOHAMED VI">CENTRE DE FORMATION PROFESSIONNELLE MOHAMED VI</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE VINANINKARENA">LYCÉE TECHNIQUE PROFESSIONNELLE VINANINKARENA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNEL DE REFERENCE BETAFO">CENTRE DE FORMATION PROFESSIONNEL DE REFERENCE BETAFO</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE ANTSIRABE">LYCÉE TECHNIQUE PROFESSIONNELLE ANTSIRABE</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE ANDRANOMANELATRA">LYCÉE TECHNIQUE PROFESSIONNELLE ANDRANOMANELATRA</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE FARATSIHO">LYCÉE TECHNIQUE PROFESSIONNELLE FARATSIHO</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE MANDOTO">LYCÉE TECHNIQUE PROFESSIONNELLE MANDOTO</option>
    <option value="GROUPEMENT DE LA GN VAKINANKARATRA">GROUPEMENT DE LA GN VAKINANKARATRA</option>
    <option value="TRIBUNAL PREMIERE INSTANCE ANTSIRABE">TRIBUNAL PREMIERE INSTANCE ANTSIRABE</option>
    <option value="DIRECTION REGIONALE DE L'EDUCATION NATIONALE VAKINANKARATRA">DIRECTION REGIONALE DE L'EDUCATION NATIONALE VAKINANKARATRA</option>
    <option value="DIRECTION RÉGIONALE DE L’ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION">DIRECTION RÉGIONALE DE L’ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION</option>
    <option value="REGION VAKINANKARATRA">REGION VAKINANKARATRA</option>
    <option value="COMMUNE AMBATOLAMPY">COMMUNE AMBATOLAMPY</option>
    <option value="Commune Rurale Antanifotsy">Commune Rurale Antanifotsy</option>
    <option value="COMMUNE URBAINE ANTSIRABE I">COMMUNE URBAINE ANTSIRABE I</option>
    <option value="COMMUNE BETAFO">COMMUNE BETAFO</option>
    <option value="Commune Faratsiho">Commune Faratsiho</option>
    <option value="Chambre de Commerce et d'Industrie Antsirabe">Chambre de Commerce et d'Industrie Antsirabe</option>
    <option value="CAFPA ANTSIRABE">CAFPA ANTSIRABE</option>
    <option value="DIRECTION GENERALE DU CFFAMMA">DIRECTION GENERALE DU CFFAMMA</option>
    <option value="FIFAMANOR ANTSIRABE">FIFAMANOR ANTSIRABE</option>
  </select>
</div>


  <label>
    Nom de la propriété
    <input
      type="text"
      name="nomduproprieter"
      placeholder="Nom de la propriété"
      value={formData.nomduproprieter}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
    Numéro du propriété
    <input
      type="text"
      name="numeroproprieter"
      placeholder="Numéro du propriété"
      value={formData.numeroproprieter}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
    Surface
    <input
      type="text"
      name="surface"
      placeholder="Surface"
      value={formData.surface}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <button onClick={generatePDF} style={{ padding: "10px", marginTop: "10px" }}>
    Générer le PDF
  </button>
  <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSubmitrecensement}
        sx={{ marginBottom: 4 }}
      >
        Fiche de recensement
      </Button>
</div>

    </Box>
  </Box>
</Modal>

{/* tres Grand Modal */}
<Modal open={isVeryLargeModalOpen} onClose={handleCloseVeryLargeModal}>
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
        onClick={handleCloseVeryLargeModal}
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
        Formulaire de Recensement
      </Typography>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

  <div>
  <label htmlFor="ministere">Ministère : </label>
  <select
    id="ministere"
    name="ministere"
    value={formData.ministere}
    onChange={handleChange}
  >
    <option value="MINISTÈRE DES AFFAIRES ETRANGÈRES I">MINISTÈRE DES AFFAIRES ETRANGÈRES
</option>
    <option value="MINISTÈRE DES FORCES ARMEES">MINISTÈRE DES FORCES ARMEES
</option>
    <option value="MINISTÈRE DELEGUÉ EN CHARGE DE LA GENDARMERIE NATIONALE">MINISTÈRE DELEGUÉ EN CHARGE DE LA GENDARMERIE NATIONALE
</option>
    <option value="MINISTÈRE DE L’INTÉRIEUR">MINISTÈRE DE L’INTÉRIEUR
</option>
    <option value="MINISTÈRE DE LA SÉCURITÉ PUBLIQUE">MINISTÈRE DE LA SÉCURITÉ PUBLIQUE
</option>
    <option value="MINISTÈRE DE LA JUSTICE">MINISTÈRE DE LA JUSTICE
</option>
    <option value="MINISTÈRE DE L'ECONOMIE ET DES FINANCES">MINISTERE DE L'ECONOMIE ET DES FINANCES
</option>
<option value="MINISTÈRE DU TRAVAIL, DE L'EMPLOI ET DE LA FONCTION PUBLIQUE">MINISTERE DU TRAVAIL, DE L'EMPLOI ET DE LA FONCTION PUBLIQUE
</option>
<option value="MINISTÈRE DU TOURISME ET DE L'ARTISANAT">MINISTERE DU TOURISME ET DE L'ARTISANAT
</option>
<option value="MINISTÈRE DE LA COMMUNICATION ET DE LA CULTURE">MINISTERE DE LA COMMUNICATION ET DE LA CULTURE
</option>
<option value="MINISTÈRE DE L'ARTISANAT ET DES METIERS">MINISTERE DE L'ARTISANAT ET DES METIERS
</option>
<option value="MINISTÈRE DE L'INDUSTRIALISATION ET DU COMMERCE">MINISTERE DE L'INDUSTRIALISATION ET DU COMMERCE
</option>
<option value="MINISTÈRE DE L'ENVIRONNEMENT ET DU DEVELOPPEMENT DURABLE">MINISTERE DE L'ENVIRONNEMENT ET DU DEVELOPPEMENT DURABLE
</option>
<option value="MINISTÈRE DE L’AGRICULTURE ET DE L’ELEVAGE">MINISTERE DE L’AGRICULTURE ET DE L’ELEVAGE
</option>
<option value="MINISTÈRE DE LA PECHE ET DE L'ECONOMIE BLEUE">MINISTERE DE LA PECHE ET DE L'ECONOMIE BLEUE
</option>
<option value="MINISTÈRE DE L'ENERGIE ET DES HYDROCARBURES">MINISTERE DE L'ENERGIE ET DES HYDROCARBURES
</option>
<option value="MINISTÈRE DE L'EAU, DE L'ASSAINISSEMENT ET DE L'HYGIENE">MINISTERE DE L'EAU, DE L'ASSAINISSEMENT ET DE L'HYGIENE
</option>
<option value="MINISTÈRE DES MINES">MINISTERE DES MINES
</option>
<option value="MINISTÈRE DU DÉVELOPPEMENT NUMÉRIQUE, DES POSTES ET DES TÉLÉCOMMUNICATIONS">MINISTÈRE DU DÉVELOPPEMENT NUMÉRIQUE, DES POSTES ET DES TÉLÉCOMMUNICATIONS
</option>
<option value="MINISTÈRE DES TRAVAUX PUBLICS">MINISTERE DES TRAVAUX PUBLICS
</option>
<option value="MINISTÈRE DES TRANSPORTS ET DE LA METEOROLOGIE">MINISTERE DES TRANSPORTS ET DE LA METEOROLOGIE
</option>
<option value="MINISTÈRE DE LA DECENTRALISATION ET DE L’AMENAGEMENT DU TERRITOIRE">MINISTERE DE LA DECENTRALISATION ET DE L’AMENAGEMENT DU TERRITOIRE
</option>
<option value="MINISTÈRE DE LA SANTÉ PUBLIQUE">MINISTÈRE DE LA SANTÉ PUBLIQUE
</option>
<option value="MINISTÈRE DE LA JEUNESSE ET DES SPORTS">MINISTÈRE DE LA JEUNESSE ET DES SPORTS
</option>
<option value="MINISTÈRE DE LA POPULATION ET DES SOLIDARITES">MINISTÈRE DE LA POPULATION ET DES SOLIDARITES
</option>
<option value="MINISTÈRE DE L'EDUCATION NATIONALE">MINISTERE DE L'EDUCATION NATIONALE
</option>
<option value="MINISTÈRE DE L'ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE">MINISTERE DE L'ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE
</option>
<option value="MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE">MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE
</option>
  </select>
</div>

  <div>
  <label htmlFor="direction">Direction : </label>
  <select
    id="direction"
    name="direction"
    value={formData.direction}
    onChange={handleChange}
  >
    <option value="SECRETARIAT PERMANENT REGIONAL (CER) VAKINANKARATRA">SECRETARIAT PERMANENT REGIONAL (CER) VAKINANKARATRA</option>
  <option value="ANTENNE (CED) AMBATOLAMPY">ANTENNE (CED) AMBATOLAMPY</option>
  <option value="ANTENNE (CED) ANTANIFOTSY">ANTENNE (CED) ANTANIFOTSY</option>
  <option value="ANTENNE (CED) ANTSIRABE I">ANTENNE (CED) ANTSIRABE I</option>
  <option value="ANTENNE (CED) ANTSIRABE II">ANTENNE (CED) ANTSIRABE II</option>
  <option value="ANTENNE (CED) BETAFO">ANTENNE (CED) BETAFO</option>
  <option value="ANTENNE (CED) FARATSIHO">ANTENNE (CED) FARATSIHO</option>
  <option value="ANTENNE (CED) MANDOTO">ANTENNE (CED) MANDOTO</option>
  <option value="ACADEMIE MILITAIRE D'ANTSIRABE">ACADEMIE MILITAIRE D'ANTSIRABE</option>
  <option value="ECOLE NATIONALE DES SOUS OFFICIERS DE L'ARMEE">ECOLE NATIONALE DES SOUS OFFICIERS DE L'ARMEE</option>
  <option value="DELEGATION MILITAIRE REGIONALE (DMR) VAKINAKARATRA">DELEGATION MILITAIRE REGIONALE (DMR) VAKINAKARATRA</option>
  <option value="GROUPEMENT DE LA GN VAKINANKARATRA">GROUPEMENT DE LA GN VAKINANKARATRA</option>
  <option value="SECRETARIAT GENERAL DE LA PREFECTURE D'ANTSIRABE I">SECRETARIAT GENERAL DE LA PREFECTURE D'ANTSIRABE I</option>
  <option value="PREFECTURE D'ANTSIRABE I">PREFECTURE D'ANTSIRABE I</option>
  <option value="PERSONNE RESPONSABLE DES MARCHES PUBLICS">PERSONNE RESPONSABLE DES MARCHES PUBLICS</option>
  <option value="DISTRICT D'AMBATOLAMPY">DISTRICT D'AMBATOLAMPY</option>
  <option value="DISTRICT D'ANTANIFOTSY">DISTRICT D'ANTANIFOTSY</option>
  <option value="DISTRICT ANTSIRABE I">DISTRICT ANTSIRABE I</option>
  <option value="DISTRICT ANTSIRABE II">DISTRICT ANTSIRABE II</option>
  <option value="DISTRICT DE BETAFO">DISTRICT DE BETAFO</option>
  <option value="DISTRICT DE MANDOTO">DISTRICT DE MANDOTO</option>
  <option value="DISTRICT DE FARATSIHO">DISTRICT DE FARATSIHO</option>
  <option value="DIRECTION REGIONALE DE LA SECURITE PUBLIQUE DE VAKINANKARATRA">DIRECTION REGIONALE DE LA SECURITE PUBLIQUE DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L'ADMINISTRATION PENITENTIAIRE VAKINANKARATRA">DIRECTION REGIONALE DE L'ADMINISTRATION PENITENTIAIRE VAKINANKARATRA</option>
  <option value="TRIBUNAL PREMIERE INSTANCE AMBATOLAMPY">TRIBUNAL PREMIERE INSTANCE AMBATOLAMPY</option>
  <option value="TRIBUNAL PREMIERE INSTANCE ANTSIRABE">TRIBUNAL PREMIERE INSTANCE ANTSIRABE</option>
  <option value="SERVICE REGIONAL DES ETUDES ET DE LA PROGRAMMATION VAKINANKARATRA">SERVICE REGIONAL DES ETUDES ET DE LA PROGRAMMATION VAKINANKARATRA</option>
  <option value="COMMISSION REGIONALE DES MARCHES VAKINANKARATRA">COMMISSION REGIONALE DES MARCHES VAKINANKARATRA</option>
  <option value="TRESORERIE GENERALE VAKINANKARATRA">TRESORERIE GENERALE VAKINANKARATRA</option>
  <option value="PP AMBATOLAMPY">PP AMBATOLAMPY</option>
  <option value="PP ANTANIFOTSY">PP ANTANIFOTSY</option>
  <option value="PP BETAFO">PP BETAFO</option>
  <option value="PP FARATSIHO">PP FARATSIHO</option>
  <option value="SECOURS AU DECES DES AGENTS FINANCES VAKINAKARATRA">SECOURS AU DECES DES AGENTS FINANCES VAKINAKARATRA</option>
  <option value="SERVICE REGIONAL DU BUDGET VAKINANKARATRA">SERVICE REGIONAL DU BUDGET VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA SOLDE ET DES PENSIONS VAKINANKARATRA">SERVICE REGIONAL DE LA SOLDE ET DES PENSIONS VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DES IMPÔTS VAKINANKARATRA">DIRECTION REGIONALE DES IMPÔTS VAKINANKARATRA</option>
  <option value="RECETTES DES DOUANES ANTSIRABE">RECETTES DES DOUANES ANTSIRABE</option>
  <option value="DELEGATION RÉGIONALE DU CONTRÔLE FINANCIER VAKINANKARATRA">DELEGATION RÉGIONALE DU CONTRÔLE FINANCIER VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE L'ECONOMIE ET DU PLAN VAKINANKARATRA">SERVICE REGIONAL DE L'ECONOMIE ET DU PLAN VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DU TRAVAIL ET DES LOIS SOCIALES VAKINANKARATRA">SERVICE REGIONAL DU TRAVAIL ET DES LOIS SOCIALES VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DU TRAVAIL VAKINANKARATRA">SERVICE REGIONAL DU TRAVAIL VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DU TRAVAIL, DE L'EMPLOI, DE LA FONCTION PUBLIQUE, ET DES LOIS SOCIALES VAKINANKARATRA">DIRECTION REGIONALE DU TRAVAIL, DE L'EMPLOI, DE LA FONCTION PUBLIQUE, ET DES LOIS SOCIALES VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA FONCTION PUBLIQUE VAKINANKARATRA">SERVICE REGIONAL DE LA FONCTION PUBLIQUE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DU TRAVAIL, DE L'EMPLOI ET DE LA FONCTION PUBLIQUE VAKINANKARATRA">DIRECTION REGIONALE DU TRAVAIL, DE L'EMPLOI ET DE LA FONCTION PUBLIQUE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA FONCTION PUBLIQUE VAKINANKARATRA">SERVICE REGIONAL DE LA FONCTION PUBLIQUE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE L'EMPLOI VAKINANKARATRA">SERVICE REGIONAL DE L'EMPLOI VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DU TOURISME ET DE L'ARTISANAT DE VAKINANKARATRA">DIRECTION REGIONALE DU TOURISME ET DE L'ARTISANAT DE VAKINANKARATRA</option>
  <option value="DIRECTION INTERREGIONALE DU TOURISME AMORON'I MANIA-VAKINANKARATRA">DIRECTION INTERREGIONALE DU TOURISME AMORON'I MANIA-VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE VAKINANKARATRA">DIRECTION REGIONALE DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L’ARTISANAT ET DES METIERS DE VAKINANKARATRA">DIRECTION REGIONALE DE L’ARTISANAT ET DES METIERS DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L’INDUSTRIALISATION, DU COMMERCE ET DE LA CONSOMMATION (DRICC) DE VAKINANKARATRA">DIRECTION REGIONALE DE L’INDUSTRIALISATION, DU COMMERCE ET DE LA CONSOMMATION (DRICC) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L’INDUSTRIALISATION ET DU COMMERCE (DRIC) DE VAKINANKARATRA">DIRECTION REGIONALE DE L’INDUSTRIALISATION ET DU COMMERCE (DRIC) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L'ENVIRONNEMENT ET DU DEVELOPPEMENT DURABLE (DREDD) VAKINANKARATRA">DIRECTION REGIONALE DE L'ENVIRONNEMENT ET DU DEVELOPPEMENT DURABLE (DREDD) VAKINANKARATRA</option>
  <option value="DIRECTIONS REGIONALES DE L'AGRICULTURE ET DE L’ELEVAGE (DRAE) VAKINANKARATRA">DIRECTIONS REGIONALES DE L'AGRICULTURE ET DE L’ELEVAGE (DRAE) VAKINANKARATRA</option>
  <option value="DIRECTIONS REGIONALES DE LA PÊCHE ET DE L’ÉCONOMIE BLEUE (DRPEB) VAKINANKARATRA">DIRECTIONS REGIONALES DE LA PÊCHE ET DE L’ÉCONOMIE BLEUE (DRPEB) VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DES AFFAIRES ADMINISTRATIVES ET FINANCIERES (SRAAF) VAKINANKARATRA">SERVICE REGIONAL DES AFFAIRES ADMINISTRATIVES ET FINANCIERES (SRAAF) VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA PÊCHE ET DE L’AQUACULTURE (SRPA) VAKINANKARATRA">SERVICE REGIONAL DE LA PÊCHE ET DE L’AQUACULTURE (SRPA) VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE L’ECONOMIE BLEUE (SREB) VAKINANKARATRA">SERVICE REGIONAL DE L’ECONOMIE BLEUE (SREB) VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DU SYSTEME D’INFORMATION, DE LA STATISTIQUE ET DU SUIVI-EVALUATION (SRSISSE) VAKINANKARATRA">SERVICE REGIONAL DU SYSTEME D’INFORMATION, DE LA STATISTIQUE ET DU SUIVI-EVALUATION (SRSISSE) VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L'EAU, DE L'ASSAINISSEMENT ET DE L'HYGIENE (DREAH) VAKINANKARATRA">DIRECTION REGIONALE DE L'EAU, DE L'ASSAINISSEMENT ET DE L'HYGIENE (DREAH) VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE VAKINANKARATRA">DIRECTION REGIONALE VAKINANKARATRA</option>
  <option value="DELEGATIONS LOCALES DES NOUVELLES VILLES ET DE L’HABITAT (DLNVH) DE VAKINANKARATRA">DELEGATIONS LOCALES DES NOUVELLES VILLES ET DE L’HABITAT (DLNVH) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DES TRAVAUX PUBLICS DE VAKINANKARATRA">DIRECTION REGIONALE DES TRAVAUX PUBLICS DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DES TRANSPORTS ET DE LA METEOROLOGIE (DRTM) DE VAKINANKARATRA">DIRECTION REGIONALE DES TRANSPORTS ET DE LA METEOROLOGIE (DRTM) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DES TRANSPORTS (SRT) DE VAKINANKARATRA">SERVICE REGIONAL DES TRANSPORTS (SRT) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONALE DE LA METEOROLOGIE (SRM) DE VAKINANKARATRA">SERVICE REGIONALE DE LA METEOROLOGIE (SRM) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DES DOMAINES (SRD) DE VAKINANKARATRA">SERVICE REGIONAL DES DOMAINES (SRD) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL TOPOGRAPHIQUE (SRTOPO) DE VAKINANKARATRA">SERVICE REGIONAL TOPOGRAPHIQUE (SRTOPO) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L’AMENAGEMENT DU TERRITOIRE ET DES SERVICES FONCIERS (DRATSF) DE VAKINANKARATRA">DIRECTION REGIONALE DE L’AMENAGEMENT DU TERRITOIRE ET DES SERVICES FONCIERS (DRATSF) DE VAKINANKARATRA</option>
  <option value="Direction Régionale de la Décentralisation, de l'Aménagement du Territoire et des Services Fonciers (DRDATSF) DE VAKINANKARATRA">Direction Régionale de la Décentralisation, de l'Aménagement du Territoire et des Services Fonciers (DRDATSF) DE VAKINANKARATRA</option>
  <option value="Service Régional de la Décentralisation et de l'Aménagement du Territoire (SRDAT) DE VAKINANKARATRA">Service Régional de la Décentralisation et de l'Aménagement du Territoire (SRDAT) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE L’AMENAGEMENT DU TERRITOIRE (SRAT) DE VAKINANKARATRA">SERVICE REGIONAL DE L’AMENAGEMENT DU TERRITOIRE (SRAT) DE VAKINANKARATRA</option>
  <option value="SERVICE REGIONAL DE LA DECENTRALISATION, DE L’AMENAGEMENT DU TERRITOIRE (SRDAT) DE VAKINANKARATRA">SERVICE REGIONAL DE LA DECENTRALISATION, DE L’AMENAGEMENT DU TERRITOIRE (SRDAT) DE VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE LA SANTE PUBLIQUE (DRSP) VAKINANKARATRA">DIRECTION REGIONALE DE LA SANTE PUBLIQUE (DRSP) VAKINANKARATRA</option>
  <option value="CELLULE DE SUIVI ET D'EVALUATION DES PERFORMANCES (CSEP) VAKINANKARATRA">CELLULE DE SUIVI ET D'EVALUATION DES PERFORMANCES (CSEP) VAKINANKARATRA</option>
  <option value="SERVICE MEDICO SANITAIRE (SMSan) VAKINANKARATRA">SERVICE MEDICO SANITAIRE (SMSan) VAKINANKARATRA</option>
  <option value="SERVICE DE LA MAINTENANCE, DU GENIE SANITAIRE ET DE SANTE ENVIRONNEMENT (SMGSSE) VAKINANKARATRA">SERVICE DE LA MAINTENANCE, DU GENIE SANITAIRE ET DE SANTE ENVIRONNEMENT (SMGSSE) VAKINANKARATRA</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE REGIONALE (CHRR) VAKINANKARATRA">CENTRE HOSPITALIER DE REFERENCE REGIONALE (CHRR) VAKINANKARATRA</option>
  <option value="SERVICE DU CONTENTIEUX ET DU PATRIMOINE (SCP) VAKINANKARATRA">SERVICE DU CONTENTIEUX ET DU PATRIMOINE (SCP) VAKINANKARATRA</option>
  <option value="PERSONNE RESPONSABLE DES MARCHES PUBLICS (PRMP) VAKINANKARATRA">PERSONNE RESPONSABLE DES MARCHES PUBLICS (PRMP) VAKINANKARATRA</option>
  <option value="UNITE MEDICO- SOCIALE REGIONALE (UMSR) VAKINANKARATRA">UNITE MEDICO- SOCIALE REGIONALE (UMSR) VAKINANKARATRA</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) AMBATOLAMPY">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) AMBATOLAMPY</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTANIFOTSY">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTANIFOTSY</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTSIRABE I">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTSIRABE I</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTSIRABE II">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) ANTSIRABE II</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) BETAFO">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) BETAFO</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) FARATSIHO">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) FARATSIHO</option>
  <option value="SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) MANDOTO">SERVICE DE DISTRICT DE LA SANTE PUBLIQUE (SDSP) MANDOTO</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) AMBATOLAMPY">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) AMBATOLAMPY</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) ANTANIFOTSY">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) ANTANIFOTSY</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) BETAFO">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) BETAFO</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) FARATSIHO">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) FARATSIHO</option>
  <option value="CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) ANDRANOMANELATRA">CENTRE HOSPITALIER DE REFERENCE DE DISTRICT (CHRD) ANDRANOMANELATRA</option>
  <option value="CENTRE DE REEDUCATION MOTRICE DE MADAGASCAR (CRMM) D'ANTSIRABE">CENTRE DE REEDUCATION MOTRICE DE MADAGASCAR (CRMM) D'ANTSIRABE</option>
  <option value="CENTRE NATIONAL DE CRENOTHERAPIE ET DE THERMOCLIMATISME (CNCT) D'ANTSIRABE">CENTRE NATIONAL DE CRENOTHERAPIE ET DE THERMOCLIMATISME (CNCT) D'ANTSIRABE</option>
  <option value="DIRECTION REGIONALE DE LA JEUNESSE ET DES SPORTS (DRJS) VAKINANKARATRA">DIRECTION REGIONALE DE LA JEUNESSE ET DES SPORTS (DRJS) VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE LA POPULATION ET DES SOLIDARITES / VAKINANKARATRA">DIRECTION REGIONALE DE LA POPULATION ET DES SOLIDARITES / VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE LA POPULATION, DE LA PROTECTION SOCIALE ET DE LA PROMOTION DE LA FEMME / VAKINANKARATRA">DIRECTION REGIONALE DE LA POPULATION, DE LA PROTECTION SOCIALE ET DE LA PROMOTION DE LA FEMME / VAKINANKARATRA</option>
  <option value="DIRECTION REGIONALE DE L'EDUCATION NATIONALE VAKINANKARATRA">DIRECTION REGIONALE DE L'EDUCATION NATIONALE VAKINANKARATRA</option>
  <option value="CISCO AMBATOLAMPY">CISCO AMBATOLAMPY</option>
  <option value="CISCO ANTANIFOTSY">CISCO ANTANIFOTSY</option>
  <option value="CISCO ANTSIRABE I">CISCO ANTSIRABE I</option>
  <option value="CISCO ANTSIRABE II">CISCO ANTSIRABE II</option>
  <option value="CISCO BETAFO">CISCO BETAFO</option>
  <option value="CISCO FARATSIHO">CISCO FARATSIHO</option>
  <option value="CISCO MANDOTO">CISCO MANDOTO</option>
  <option value="ZAP AMBATOLAMPY">ZAP AMBATOLAMPY</option>
  <option value="ZAP ANTANIFOTSY">ZAP ANTANIFOTSY</option>
  <option value="ZAP ANTSIRABE I">ZAP ANTSIRABE I</option>
  <option value="ZAP ANTSIRABE II">ZAP ANTSIRABE II</option>
  <option value="ZAP BETAFO">ZAP BETAFO</option>
  <option value="ZAP FARATSIHO">ZAP FARATSIHO</option>
  <option value="ZAP MANDOTO">ZAP MANDOTO</option>
  <option value="SERVICE DE LA COORDINATION DE LA FORMATION ET DE L'APPRENTISSAGE VAKINANKARATRA">SERVICE DE LA COORDINATION DE LA FORMATION ET DE L'APPRENTISSAGE VAKINANKARATRA</option>
    <option value="SERVICE DE L'INGENERIE DE FORMATION ET PEDAGOGIQUE VAKINANKARATRA">SERVICE DE L'INGENERIE DE FORMATION ET PEDAGOGIQUE VAKINANKARATRA</option>
    <option value="SERVICE DE L'EVALUATION DES ACQUIS VAKINANKARATRA">SERVICE DE L'EVALUATION DES ACQUIS VAKINANKARATRA</option>
    <option value="SERVICE D'INFORMATION ET D'ORIENTATION VAKINANKARATRA">SERVICE D'INFORMATION ET D'ORIENTATION VAKINANKARATRA</option>
    <option value="SERVICE DE L'INGENIERIE DE FORMATION PEDAGOGIQUE VAKINANKARATRA">SERVICE DE L'INGENIERIE DE FORMATION PEDAGOGIQUE VAKINANKARATRA</option>
    <option value="SERVICE ADMINISTRATIF ET FINANCIER VAKINANKARATRA">SERVICE ADMINISTRATIF ET FINANCIER VAKINANKARATRA</option>
    <option value="DIRECTION RÉGIONALE DE L’ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE VAKINANKARATRA">DIRECTION RÉGIONALE DE L’ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION PROFESSIONNELLE VAKINANKARATRA</option>
    <option value="SERVICE DES AFFAIRES ADMINISTRATIVES ET FINANCIÈRES VAKINANKARATRA">SERVICE DES AFFAIRES ADMINISTRATIVES ET FINANCIÈRES VAKINANKARATRA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE ANTSIRABE">CENTRE DE FORMATION PROFESSIONNELLE ANTSIRABE</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE AMBOHIBARY SAMBAINA">CENTRE DE FORMATION PROFESSIONNELLE AMBOHIBARY SAMBAINA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE ANTSOANTANY">CENTRE DE FORMATION PROFESSIONNELLE ANTSOANTANY</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE MANANDONA">CENTRE DE FORMATION PROFESSIONNELLE MANANDONA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE ANKAZOMIRIOTRA">CENTRE DE FORMATION PROFESSIONNELLE ANKAZOMIRIOTRA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNELLE MOHAMED VI">CENTRE DE FORMATION PROFESSIONNELLE MOHAMED VI</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE VINANINKARENA">LYCÉE TECHNIQUE PROFESSIONNELLE VINANINKARENA</option>
    <option value="CENTRE DE FORMATION PROFESSIONNEL DE REFERENCE BETAFO">CENTRE DE FORMATION PROFESSIONNEL DE REFERENCE BETAFO</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE ANTSIRABE">LYCÉE TECHNIQUE PROFESSIONNELLE ANTSIRABE</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE ANDRANOMANELATRA">LYCÉE TECHNIQUE PROFESSIONNELLE ANDRANOMANELATRA</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE FARATSIHO">LYCÉE TECHNIQUE PROFESSIONNELLE FARATSIHO</option>
    <option value="LYCÉE TECHNIQUE PROFESSIONNELLE MANDOTO">LYCÉE TECHNIQUE PROFESSIONNELLE MANDOTO</option>
    <option value="GROUPEMENT DE LA GN VAKINANKARATRA">GROUPEMENT DE LA GN VAKINANKARATRA</option>
    <option value="TRIBUNAL PREMIERE INSTANCE ANTSIRABE">TRIBUNAL PREMIERE INSTANCE ANTSIRABE</option>
    <option value="DIRECTION REGIONALE DE L'EDUCATION NATIONALE VAKINANKARATRA">DIRECTION REGIONALE DE L'EDUCATION NATIONALE VAKINANKARATRA</option>
    <option value="DIRECTION RÉGIONALE DE L’ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION">DIRECTION RÉGIONALE DE L’ENSEIGNEMENT TECHNIQUE ET DE LA FORMATION</option>
    <option value="REGION VAKINANKARATRA">REGION VAKINANKARATRA</option>
    <option value="COMMUNE AMBATOLAMPY">COMMUNE AMBATOLAMPY</option>
    <option value="Commune Rurale Antanifotsy">Commune Rurale Antanifotsy</option>
    <option value="COMMUNE URBAINE ANTSIRABE I">COMMUNE URBAINE ANTSIRABE I</option>
    <option value="COMMUNE BETAFO">COMMUNE BETAFO</option>
    <option value="Commune Faratsiho">Commune Faratsiho</option>
    <option value="Chambre de Commerce et d'Industrie Antsirabe">Chambre de Commerce et d'Industrie Antsirabe</option>
    <option value="CAFPA ANTSIRABE">CAFPA ANTSIRABE</option>
    <option value="DIRECTION GENERALE DU CFFAMMA">DIRECTION GENERALE DU CFFAMMA</option>
    <option value="FIFAMANOR ANTSIRABE">FIFAMANOR ANTSIRABE</option>
  </select>
</div>

  <div>
  <label htmlFor="district">District : </label>
  <select
    id="district"
    name="district"
    value={formData.district}
    onChange={handleChange}
  >
    <option value="ANTSIRABE I">ANTSIRABE I</option>
    <option value="ANTSIRABE II">ANTSIRABE II</option>
    <option value="BETAFO">BETAFO</option>
    <option value="AMBATOLAMPY">AMBATOLAMPY</option>
    <option value="ANTANIFOTSY">ANTANIFOTSY</option>
    <option value="FARATSIHO">FARATSIHO</option>
    <option value="MANDOTO">MANDOTO</option>
  </select>
</div>


  <div>
    <label htmlFor="commune">Commune : </label>
    <input
      type="text"
      id="commune"
      name="commune"
      placeholder="Commune"
      value={formData.commune}
      onChange={handleChange}
    />
  </div>

  <h2>Tableau</h2>
  {formData.rows.map((row, index) => (
    <div key={index} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div>
        <label>Titre : </label>
        <input
          type="text"
          placeholder="Titre"
          value={row.titre}
          onChange={(e) => handleChange(e, index, "titre")}
        />
      </div>

      <div>
        <label>Nom de la propriété : </label>
        <input
          type="text"
          placeholder="Nom de la propriété"
          value={row.nomPropriete}
          onChange={(e) => handleChange(e, index, "nomPropriete")}
        />
      </div>

      <div>
        <label>Adresse physique : </label>
        <input
          type="text"
          placeholder="Adresse physique"
          value={row.adressePhysique}
          onChange={(e) => handleChange(e, index, "adressePhysique")}
        />
      </div>

      <div>
        <label>Usage : </label>
        <input
          type="text"
          placeholder="Usage"
          value={row.usage}
          onChange={(e) => handleChange(e, index, "usage")}
        />
      </div>

      <div>
        <label>Nom et Prénoms : </label>
        <input
          type="text"
          placeholder="Nom et Prénoms"
          value={row.nomPrenoms}
          onChange={(e) => handleChange(e, index, "nomPrenoms")}
        />
      </div>

      <div>
        <label>IM : </label>
        <input
          type="text"
          placeholder="IM"
          value={row.im}
          onChange={(e) => handleChange(e, index, "im")}
        />
      </div>

      <div>
        <label>Fonction : </label>
        <input
          type="text"
          placeholder="Fonction"
          value={row.fonction}
          onChange={(e) => handleChange(e, index, "fonction")}
        />
      </div>

      <div>
        <label>Réf. Décision : </label>
        <input
          type="text"
          placeholder="Réf. Décision"
          value={row.refDecision}
          onChange={(e) => handleChange(e, index, "refDecision")}
        />
      </div>

      <div>
        <label>Nombre de pièces : </label>
        <input
          type="text"
          placeholder="Nombre de pièces"
          value={row.nbPiecesEtages}
          onChange={(e) => handleChange(e, index, "nbPiecesEtages")}
        />
      </div>

      <div>
        <label>État de la bâtisse : </label>
        <input
          type="text"
          placeholder="État de la bâtisse"
          value={row.etatBatiment}
          onChange={(e) => handleChange(e, index, "etatBatiment")}
        />
      </div>

      <div>
        <label>Observations : </label>
        <input
          type="text"
          placeholder="Observations"
          value={row.observations}
          onChange={(e) => handleChange(e, index, "observations")}
        />
      </div>
    </div>
  ))}

  <button onClick={addRow}>Ajouter une ligne</button>
  <button onClick={generatePDFrecensement}>Générer le PDF</button>
</div>

    </Box>
  </Box>
</Modal>
    </Box>
  );
};

export default Recensement;
