import React, { useState } from "react";
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Etatdeslieux: React.FC = () => {
  const [isVeryLargeModalOpen, setVeryLargeModalOpen] = useState(false);

  type RowType = {
    pieces: string;
    dallage: string;
    nombreporte: string;
    mesure: string;
    nombrefenetre: string;
    observations: string;
  };

  type FormDataType = {
    logementfonction: string;
    logementcomposer: string;
    rows: RowType[];
  };

  const [formData, setFormData] = useState<FormDataType>({
    logementfonction: "",
    logementcomposer: "",
    rows: [
      {
        pieces: "",
        dallage: "",
        nombreporte: "",
        mesure: "",
        nombrefenetre: "",
        observations: "",
      },
    ],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number,
    field?: keyof RowType
  ) => {
    const { name, value } = e.target;

    if (index !== undefined && field) {
      setFormData((prev) => {
        const updatedRows = [...prev.rows];
        updatedRows[index][field] = value;
        return { ...prev, rows: updatedRows };
      });
    } else {
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
          pieces: "",
          dallage: "",
          nombreporte: "",
          mesure: "",
          nombrefenetre: "",
          observations: "",
        },
      ],
    });
  };

  const logementComposerFormatted = formData.logementcomposer
  .split(",") // Divise la chaîne en éléments basés sur la virgule
  .map(item => `- ${item.trim()}`) // Ajoute un tiret et supprime les espaces inutiles
  .join("\n"); // Rejoint les éléments avec des sauts de ligne

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("N°      /24-MEF/SG/DGBF/DB/SRB-Vak", 10, 20);

    let yOffset = 30; // Position verticale de départ
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text(
        "ETAT DES LIEUX",
        doc.internal.pageSize.getWidth() / 2,
        yOffset,
        { align: "center" }
    );

    doc.setFontSize(12);
    doc.text(`LOGEMENT DE FONCTION : ${formData.logementfonction}`, 10, 40);
    doc.text("* Logement composé de :", 10, 50); // Titre
    doc.text(logementComposerFormatted, 10, 60); // Valeur formatée avec tirets

    doc.setFontSize(12);
    doc.setFont("times", "bold");
    // Ajout de 5 cm à la position verticale
    yOffset += 60; // Décale la position de 5 cm vers le bas

    doc.text(
        "DETAIL",
    doc.internal.pageSize.getWidth() / 12, // Position horizontale inchangée
    yOffset, // Nouvelle position verticale
    { align: "center" }
    );

    const columns = [
      { title: "Pièces", dataKey: "pieces" },
      { title: "Dallage", dataKey: "dallage" },
      { title: "Nombres Portes", dataKey: "nombreporte" },
      { title: "Mesure", dataKey: "mesure" },
      { title: "Nombre Fenetre", dataKey: "nombrefenetre" },
      { title: "Observations", dataKey: "observations" },
    ];
    
    const rows = formData.rows.map((row) => ({
      pieces: row.pieces,
      dallage: row.dallage,
      nombreporte: row.nombreporte,
      mesure: row.mesure,
      nombrefenetre: row.nombrefenetre,
      observations: row.observations,
    }));
    
    // Ajustez la valeur de startY pour descendre le tableau de 4 cm
    doc.autoTable({
      startY: 100, // Initialement à 60, augmenté de 40 pour descendre de 4 cm
      head: [columns.map((col) => col.title)],
      body: rows.map((row) => Object.values(row)),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [200, 200, 200] },
    });
    
    // Calcul de la position finale du tableau
    const yOffse = (doc as any).lastAutoTable.finalY + 10;
    

    doc.setFont("times", "normal");
    doc.text("En général, cet appartement est en bon état.", 10, yOffset + 150);

    yOffset += 20;
    doc.setFont("times", "normal");
    doc.text("Le Représentant du Division du Patrimoine de l’Etat", 100, 250);

    doc.setFontSize(14);
    doc.setFont("times", "normal");
    doc.text("L’occupant du logement", 10, 250);

    doc.save("Etatdeslieux.pdf");
  };

  const handleCloseVeryLargeModal = () => setVeryLargeModalOpen(false);

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
          <IconButton
            onClick={handleCloseVeryLargeModal}
            sx={{ position: "absolute", top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h4" textAlign="center" mb={2}>
            Formulaire d'état des lieux
          </Typography>

          <div>
            <label>Nom, Prénoms et IM :</label>
            <input
              type="text"
              name="logementfonction"
              value={formData.logementfonction}
              onChange={handleChange}
            />
            </div>

            <div>
            <label>Logement composé de :</label>
            <input
              type="text"
              name="logementcomposer"
              value={formData.logementcomposer}
              onChange={handleChange}
            />
          </div>

          <h2>Tableau</h2>
          {formData.rows.map((row, index) => (
            <div key={index}>
              <div>
        <label>Pièces : </label>
        <input
          type="text"
          placeholder="Pièces"
          value={row.pieces}
          onChange={(e) => handleChange(e, index, "pieces")}
        />
      </div>

      <div>
        <label>Dallage : </label>
        <input
          type="text"
          placeholder="Dallage"
          value={row.dallage}
          onChange={(e) => handleChange(e, index, "dallage")}
        />
      </div>

      <div>
        <label>Nombres Portes : </label>
        <input
          type="text"
          placeholder="Nombres Portes"
          value={row.nombreporte}
          onChange={(e) => handleChange(e, index, "nombreporte")}
        />
      </div>

      <div>
        <label>Mesure : </label>
        <input
          type="text"
          placeholder="Mesure"
          value={row.mesure}
          onChange={(e) => handleChange(e, index, "mesure")}
        />
      </div>

      <div>
        <label>Nombre Fenetre : </label>
        <input
          type="text"
          placeholder="Nombre Fenetre"
          value={row.nombrefenetre}
          onChange={(e) => handleChange(e, index, "nombrefenetre")}
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

          <Button variant="contained" onClick={addRow}>
            Ajouter une ligne
          </Button>
          <Button variant="contained" onClick={generatePDF}>
            Générer le PDF
          </Button>
        </Box>
  );
};

export default Etatdeslieux;
