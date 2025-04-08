const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const credentials = require("./credentials.json");
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE";
const SHEET1 = "Sheet1";
const SHEET2 = "Sheet2";

app.post("/send-to-sheet", async (req, res) => {
  try {
    const { timestamp, material } = req.body;
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET1}!A:B`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[timestamp, material]] },
    });

    res.send({ success: true });
  } catch (err) {
    console.error("שגיאה בשליחה ל-Google Sheets:", err);
    res.status(500).send({ error: "שליחה נכשלה" });
  }
});

app.get("/materials", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET2}!A:A`,
    });

    const materials = response.data.values ? response.data.values.flat() : [];
    res.send({ materials });
  } catch (err) {
    console.error("שגיאה בקריאת Sheet2:", err);
    res.status(500).send({ error: "שגיאה בשליפת חומרים" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("השרת פעיל על פורט", PORT);
});
