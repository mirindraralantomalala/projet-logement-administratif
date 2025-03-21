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

const Bail: React.FC = () => {
  // États
  const [checkedItems, setCheckedItems] = useState({
    Notedepresentation : false,
    Contratdebail : false,
    PhotocopieCIN : false,
    PhotocopieCertificatdesituationjuridique : false,
    FCC : false,
    Photodelimmeuble : false,
    Decretdenomination : false,
    Bulletindesolde : false,
    Etatdelieux : false,
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [observation, setObservation] = useState<"complet" | "a fournir" | "rejeter">("a fournir");
  const [isSmallModalOpen, setSmallModalOpen] = useState(false);
  const [isLargeModalOpen, setLargeModalOpen] = useState(false);

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
  ministere: string;
  dg: string;
  sg: string;
  imputation: string;
  numcompte: string;
  exercice: string;
  contratdebailnum: string;
  designationduresponsable: string;
  adressedupreneur: string;
  nomdubailleur: string;
  adressedubailleur: string;
  rezdechaussee: string;
  nombredepiece: string;
  adressedulocalloue: string;
  numtitrefoncier: string;
  logementbureaubureaulogement: string;
  designationdeloccupant: string;
  fonctiondeloccupant: string;
  dureeducontrat: string;
  montantduloyer: string;
  coderibdubailleur: string;
  lieuredactioncontrat: string;
  approbationnum: string;
  rows: RowType[];
};

const [formData, setFormData] = useState<FormDataType>({
  ministere: "",
  dg: "",
  sg: "",
  approbationnum: "",
  imputation: "",
  numcompte: "",
  exercice: "",
  contratdebailnum: "",
  designationduresponsable: "",
  adressedupreneur: "",
  nomdubailleur: "",
  adressedubailleur: "",
  rezdechaussee: "",
  nombredepiece: "",
  adressedulocalloue: "",
  numtitrefoncier: "",
  logementbureaubureaulogement: "",
  designationdeloccupant: "",
  fonctiondeloccupant: "",
  dureeducontrat: "",
  montantduloyer: "",
  coderibdubailleur: "",
  lieuredactioncontrat: "",
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

  const generatePDF = () => {
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
    doc.text(`SG ${formData.sg.toUpperCase()}`, 10, yOffset + 5);
    doc.text(`DG ${formData.dg.toUpperCase()}`, 10, yOffset + 10);

    // Partie à droite (District, commune)
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(`IMPUTATION :${formData.imputation.toUpperCase()}`, doc.internal.pageSize.getWidth() - 80, yOffset);
    doc.text(`Compte n° :${formData.numcompte.toUpperCase()}`, doc.internal.pageSize.getWidth() - 80, yOffset + 5);
    doc.text(`Exercice :${formData.exercice.toUpperCase()}`, doc.internal.pageSize.getWidth() - 80, yOffset + 10);

    // Partie au centre (Titre principal)
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(
  `CONTRAT DE BAIL N° ${formData.contratdebailnum.toUpperCase()}`,
  doc.internal.pageSize.getWidth() / 2,
  yOffset + 20,
  { align: "center" }
);

    // Texte combiné avec interpolation des données
    doc.setFontSize(12);
    doc.setFont("times", "normal");
const paragraphText = `
Entre le ${formData.ministere} agissant par délégation du Président de la République de Madagasikara et représenté par Le ${formData.designationduresponsable},sis à ${formData.adressedupreneur} désigné ci-après,le Preneur.
D’une part.Et ${formData.nomdubailleur} élisant domicile au ${formData.adressedubailleur} désigné(e) ci-après Le Bailleur.
D’autre part`;
// Définir les dimensions et marges pour le texte
const pageWidth = doc.internal.pageSize.getWidth(); // Largeur de la page
const marginLeft = 20; // Marge gauche
const textWidth = pageWidth - marginLeft * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 25; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragraphText.trim(), marginLeft, yOffset, {
  maxWidth: textWidth,
  align: "justify", // Justifier le texte
});

  // Partie au centre (Titre principal)
  doc.setFontSize(12);
  doc.setFont("times", "bold");
  doc.text(
    "IL A ETE ARRETE ET CONVENU CE QUI SUIT",
    doc.internal.pageSize.getWidth() / 2,
    yOffset + 20,
    { align: "center" }
  );

  yOffset += 30; // Ajouter un espace entre le titre et le sous-titre
    // Ajouter un titre en gras et plus grand
doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article premier. NATURE - OBJET DU BAIL - DESTINATION DES LOCAUX LOUES", 10, yOffset);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragraphTex = `${formData.nomdubailleur} loue au Gouvernement de la République de Madagasikara qui accepte un immeuble au ${formData.rezdechaussee} à ${formData.nombredepiece} pièces principales avec dépendances sis(e) au lot ${formData.adressedulocalloue} ${formData.numtitrefoncier} pour servir de ${formData.logementbureaubureaulogement} de ${formData.designationdeloccupant} ${formData.fonctiondeloccupant} auprès du ${formData.ministere}.`;

// Définir les dimensions et marges pour le texte
const pageWidt = doc.internal.pageSize.getWidth(); // Largeur de la page
const marginLef = 20; // Marge gauche
const textWidt = pageWidt - marginLef * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 5; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragraphTex.trim(), marginLef, yOffset, {
  maxWidth: textWidt,
  align: "justify", // Justifier le texte
});

yOffset += 20; // Ajouter un espace entre le titre et le sous-titre
// Ajouter un titre en gras et plus grand
doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article 2. ETAT DES LIEUX DE L’ENTREE EN OCCUPATION", 10, yOffset);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragraph = `
Avant l’occupation, un état des lieux sera dressé contradictoirement entre le Bailleur et le représentant de l’Administration. Un inventaire du mobilier existant sera établi le cas échéant.
`;

// Définir les dimensions et marges pour le texte
const pageWid = doc.internal.pageSize.getWidth(); // Largeur de la page
const margin = 20; // Marge gauche
const textWi = pageWid - margin * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 5; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragraph.trim(), margin, yOffset, {
  maxWidth: textWi,
  align: "justify", // Justifier le texte
});

yOffset += 10; // Ajouter un espace entre le titre et le sous-titre
// Ajouter un titre en gras et plus grand
doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article 3. OBLIGATIONS DES PARTIES", 10, yOffset);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragrap = `Le présent bail est consenti aux charges et conditions suivantes, que chaque partie s'engage à exécuter et respecter. Le Bailleur s'engage à :

-mettre les locaux loués à la disposition du Preneur pendant toute la durée du bail et prendre en charge les grosses réparations incombant au propriétaire selon les textes en vigueur.
-permettre au Preneur d'exercer la plénitude de ses droits, notamment la possibilité d'accéder au site à tout instant, et la possibilité aux autorités de tutelle d'accéder au site afin d'assurer le contrôle des lieux.
-informer le Preneur de tout changement sur la situation de la propriété, notamment en cas d’une inscription hypothécaire dans le Certificat d’Immatriculation et de Situation Juridique pouvant impliquer le locataire.
`;

// Définir les dimensions et marges pour le texte
const pageWi = doc.internal.pageSize.getWidth(); // Largeur de la page
const margi = 20; // Marge gauche
const textW = pageWi - margi * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 5; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragrap.trim(), margi, yOffset, {
  maxWidth: textW,
  align: "justify", // Justifier le texte
});

   // Ajouter un espace avant le prochain titre
   yOffset += 55;
 
   // Ajouter le titre "Le Preneur s'engage à"
   doc.setFont("times", "normal");
   doc.text("Le Preneur s'engage à :", 10, yOffset);
   yOffset += 7;

   doc.setFont("times", "normal");
doc.setFontSize(12);
const paragra = `
-n’exercer dans les locaux loués que l’activité décrite dans l'article premier;
-acquitter toutes les charges lui incombant et dont il pourrait être rendu responsable à un titre quelconque, ainsi que les diverses factures (eau, électricité, internet, téléphone...) durant toutes les périodes locatives de telle sorte que le Bailleur ne soit jamais inquiété à ce sujet, et d’en justifier le paiement à toute réquisition;
-faire des réparations locatives, améliorations et installations intérieures et extérieures qu’il jugera utiles mais à ses propres frais sans aucune demande de diminution ou indemnité sur le loyer et avec autorisation du Bailleur.
-remettre à l’état initial le lieu loué à la fin du bail, à moins que le Bailleur accepte de garder tous les travaux d’aménagement, de construction et de séparations effectuées sur les lieux loués. Dans ce cas, ils resteront la propriété du Bailleur.
`;

// Définir les dimensions et marges pour le texte
const pageW = doc.internal.pageSize.getWidth(); // Largeur de la page
const margine = 20; // Marge gauche
const textWid = pageW - margine * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
doc.text(paragra.trim(), margine, yOffset, {
  maxWidth: textWid,
  align: "justify", // Justifier le texte
});

yOffset += 55; // Ajouter un espace entre le titre et le sous-titre
// Ajouter un titre en gras et plus grand
doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article 5. DUREE ET DATE D’EFFET", 10, yOffset);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragraphe = `La location est faite à durée déterminée de ${formData.dureeducontrat} renouvelable et prendra effet à compter de la date d’approbation du présent contrat.
`;

// Définir les dimensions et marges pour le texte
const pageWit = doc.internal.pageSize.getWidth(); // Largeur de la page
const margina = 20; // Marge gauche
const textWit = pageWit - margina * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 5; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragraphe.trim(), margina, yOffset, {
  maxWidth: textWit,
  align: "justify", // Justifier le texte
});

yOffset += 10; // Ajouter un espace entre le titre et le sous-titre
// Ajouter un titre en gras et plus grand
doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article 4. LOYER", 10, yOffset);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragrapha = `Le prix annuel de la location est de ${formData.montantduloyer} Ariary soit ${formData.montantduloyer} Ariary par mois toutes taxes et charges comprises payables à terme échu mensuellement en un mandat sur le trésor par virement bancaire au compte n° ${formData.coderibdubailleur} au nom de ${formData.nomdubailleur}.`;

// Définir les dimensions et marges pour le texte
const pageWite = doc.internal.pageSize.getWidth(); // Largeur de la page
const margino = 20; // Marge gauche
const textWite = pageWite - margino * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 5; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragrapha.trim(), margino, yOffset, {
  maxWidth: textWite,
  align: "justify", // Justifier le texte
});

// Ajouter un saut de page
doc.addPage();

// Ajouter un titre en gras et plus grand
doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article 6. RESILIATION", 10, 20);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragraphy = `La résiliation pourra être demandée à tout moment moyennant un préavis d’un mois pour l’Administration et de trois mois pour le Bailleur.`;

// Définir les dimensions et marges pour le texte
const pageWity = doc.internal.pageSize.getWidth(); // Largeur de la page
const marginy = 20; // Marge gauche
const textWity = pageWity - marginy * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += -240; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragraphy.trim(), marginy, yOffset, {
  maxWidth: textWity,
  align: "justify", // Justifier le texte
});

doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article 7. CESSION ET SOUS LOCATION", 10, 40);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragrapho = `Toute cession du droit au présent bail ainsi que toute sous location totale ou partielle sont interdites sous peine de résiliation immédiate du bail.`;

// Définir les dimensions et marges pour le texte
const pageWitny = doc.internal.pageSize.getWidth(); // Largeur de la page
const margint = 20; // Marge gauche
const textWitn = pageWitny - margint * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 20; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragrapho.trim(), margint, yOffset, {
  maxWidth: textWitn,
  align: "justify", // Justifier le texte
});

doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article 8. LITIGE", 10, 60);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragraphyy = `Tout différend relatif aux termes du présent bail devra faire l’objet d’une tentative de règlement à l’amiable entre les parties. A défaut d’accord amiable, les parties attribuent exclusivement compétence, pour tout litige concernant le bail ou ses conséquences au Tribunal territorialement compétent.`;

// Définir les dimensions et marges pour le texte
const pageWidn = doc.internal.pageSize.getWidth(); // Largeur de la page
const marginp = 20; // Marge gauche
const textWitp = pageWidn - marginp * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 20; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragraphyy.trim(), marginp, yOffset, {
  maxWidth: textWitp,
  align: "justify", // Justifier le texte
});

doc.setFont("times", "bold");
doc.setFontSize(14);
doc.text("Article 9. APPROBATION", 10, 90);

doc.setFont("times", "normal");
doc.setFontSize(12);
const paragraphu = `Pour être valable, le présent contrat de bail doit être soumis à l’Approbation de la Direction du Patrimoine de l'Etat ou de son représentant régional agissant par délégation du Ministre chargé de l’Economie et des Finances.
Le Preneur et le Bailleur font élection de domicile aux adresses indiquées à l’introduction du présent bail.`;
// Définir les dimensions et marges pour le texte
const pageWidu = doc.internal.pageSize.getWidth(); // Largeur de la page
const marginu = 20; // Marge gauche
const textWitu = pageWidu - marginu * 2; // Largeur utilisable pour le texte

// Ajouter le paragraphe principal sous le titre
yOffset += 30; // Ajustez pour espacement entre le titre et le paragraphe
doc.text(paragraphu.trim(), marginu, yOffset, {
  maxWidth: textWitu,
  align: "justify", // Justifier le texte
});

doc.setFontSize(12);
doc.setFont("times", "bold");
doc.text("Dont acte", 10, 140);
yOffset += 20;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(`Fait à ${formData.lieuredactioncontrat},`, 150, 140);


  // Positionnement initial
  const startX = 10; // Marge gauche
  const startY = 160; // Position de départ verticale
  const columnWidth = 60; // Largeur des colonnes
  const rowHeight = 30; // Hauteur des lignes

  // Dessiner l'en-tête du tableau
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("Le Bailleur", startX + 5, startY);
  doc.text("Le Preneur", startX + columnWidth + 5, startY);
  doc.text(`Approbation n° ${formData.approbationnum}`, startX + columnWidth * 2 + 5, startY);

  // Dessiner les bordures du tableau
  doc.setDrawColor(0); // Couleur noire
  doc.setLineWidth(0.5);

  // Bordure supérieure
  doc.line(startX, startY + 2, startX + columnWidth * 3, startY + 2);

  // Bordures verticales
  for (let i = 0; i <= 3; i++) {
    doc.line(startX + columnWidth * i, startY + 2, startX + columnWidth * i, startY + rowHeight + 2);
  }

  // Bordure inférieure
  doc.line(startX, startY + rowHeight + 2, startX + columnWidth * 3, startY + rowHeight + 2);

    // Sauvegarder le fichier PDF
    doc.save("Contrat_de_bail.pdf");
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
            checked={checkedItems.Notedepresentation}
            onChange={() => handleCheckboxChange("Notedepresentation")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Note de présentation</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
          <Checkbox
            checked={checkedItems.Contratdebail}
            onChange={() => handleCheckboxChange("Contratdebail")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Contrat de bail</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
          <Checkbox
            checked={checkedItems.PhotocopieCIN}
            onChange={() => handleCheckboxChange("PhotocopieCIN")}
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
            checked={checkedItems.PhotocopieCertificatdesituationjuridique}
            onChange={() => handleCheckboxChange("PhotocopieCertificatdesituationjuridique")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Photocopie certificat de situation juridique</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.FCC}
            onChange={() => handleCheckboxChange("FCC")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>FCC</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 2 }}>
          <Checkbox
            checked={checkedItems.Photodelimmeuble}
            onChange={() => handleCheckboxChange("Photodelimmeuble")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Photo de l'immeuble</Typography>
          <IconButton component="label">
            <AttachFileIcon />
            <input type="file" hidden accept="application/pdf" onChange={handleFileUpload} />
          </IconButton>
          {uploadedFile && <Typography>{uploadedFile.name}</Typography>}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.Decretdenomination}
            onChange={() => handleCheckboxChange("Decretdenomination")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Décret de nomination</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.Bulletindesolde}
            onChange={() => handleCheckboxChange("Bulletindesolde")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Bulletin de solde</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={checkedItems.Etatdelieux}
            onChange={() => handleCheckboxChange("Etatdelieux")}
            sx={{
              color: "green",
              "&.Mui-checked": {
                color: "green",
              },
            }}
          />
          <Typography>Etat de lieux</Typography>
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
        Contrat de bail
      </Typography>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
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

  <label>
    SG
    <input
      type="text"
      name="sg"
      placeholder="SG"
      value={formData.sg}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
    DG
    <input
      type="text"
      name="dg"
      placeholder="DG"
      value={formData.dg}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
    Imputation budgétaire
    <input
      type="text"
      name="imputation"
      placeholder="Imputation"
      value={formData.imputation}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
  Ligne de crédit
    <input
      type="text"
      name="numcompte"
      placeholder="Numéro compte"
      value={formData.numcompte}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
  Exercice budgétaire
    <input
      type="text"
      name="exercice"
      placeholder="Exercice"
      value={formData.exercice}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
  Contrat de bail n°
    <input
      type="text"
      name="contratdebailnum"
      placeholder="Contrat de bail"
      value={formData.contratdebailnum}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
  Désignation du Responsable
    <input
      type="text"
      name="designationduresponsable"
      placeholder="Désignation du Responsable"
      value={formData.designationduresponsable}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>

  <label>
  Adresse du Preneur
    <input
      type="text"
      name="adressedupreneur"
      placeholder="Adresse du Preneur"
      value={formData.adressedupreneur}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Nom du Bailleur
    <input
      type="text"
      name="nomdubailleur"
      placeholder=" Nom du Bailleur"
      value={formData.nomdubailleur}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Adresse du Bailleur
    <input
      type="text"
      name="adressedubailleur"
      placeholder="Adresse du Bailleur"
      value={formData.adressedubailleur}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Rez-de-chaussée et/ou 1er étage et/ou 2ème étage
    <input
      type="text"
      name="rezdechaussee"
      placeholder="Rez-de-chaussée"
      value={formData.rezdechaussee}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Nombre de pièces principales
    <input
      type="text"
      name="nombredepiece"
      placeholder="Nombre de pièces principales"
      value={formData.nombredepiece}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Adresse complète du local loué
    <input
      type="text"
      name="adressedulocalloue"
      placeholder="Adresse complète du local loué"
      value={formData.adressedulocalloue}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Numéro du titre foncier
    <input
      type="text"
      name="numtitrefoncier"
      placeholder="Numéro du titre foncier"
      value={formData.numtitrefoncier}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <div>
  <label htmlFor="logementbureaubureaulogement">Logement, bureau, bureau-logement : </label>
  <select
    id="logementbureaubureaulogement"
    name="logementbureaubureaulogement"
    value={formData.logementbureaubureaulogement}
    onChange={handleChange}
  >
    <option value="Logement">Logement</option>
    <option value="bureau">bureau</option>
    <option value="bureau-logement">bureau-logement</option>
  </select>
</div>
<label>
Désignation de l’Occupant
    <input
      type="text"
      name="designationdeloccupant"
      placeholder="Désignation de l’Occupant"
      value={formData.designationdeloccupant}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Fonction de l'Occupant
    <input
      type="text"
      name="fonctiondeloccupant"
      placeholder="Fonction de l'Occupant"
      value={formData.fonctiondeloccupant}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Durée du contrat
    <input
      type="text"
      name="dureeducontrat"
      placeholder="Durée du contrat"
      value={formData.dureeducontrat}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Montant en ARIARY du loyer
    <input
      type="text"
      name="montantduloyer"
      placeholder="Montant du loyer"
      value={formData.montantduloyer}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Code RIB du Bailleur
    <input
      type="text"
      name="coderibdubailleur"
      placeholder="Code RIB"
      value={formData.coderibdubailleur}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Lieu
    <input
      type="text"
      name="lieuredactioncontrat"
      placeholder="Lieu"
      value={formData.lieuredactioncontrat}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
    />
  </label>
  <label>
  Approbation n°
    <input
      type="text"
      name="approbationnum"
      placeholder="Approbation n°"
      value={formData.approbationnum}
      onChange={handleChange}
      style={{ width: "100%", padding: "5px" }}
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

export default Bail;
