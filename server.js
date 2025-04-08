
const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const credentials = require("./credentials.json");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
const SPREADSHEET_ID = "1UPMdpz778_WjOrboVUbqoaoP06N-HezcYYSE8x-hntw";

app.post("/send-to-sheet", async (req, res) => {
  try {
    const { timestamp, material } = req.body;
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:B",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[timestamp, material]] }
    });
    res.send({ success: true });
  } catch (err) {
    console.error("שגיאה בשליחה:", err);
    res.status(500).send({ error: "שגיאה בשליחה" });
  }
});

app.get("/materials", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet2!A:A"
    });
    const materials = result.data.values?.flat() || [];
    res.send({ materials });
  } catch (err) {
    console.error("שגיאה בשליפת חומרים:", err);
    res.status(500).send({ error: "שגיאה בשליפת חומרים" });
  }
});

app.listen(3000, () => console.log("📡 שרת פועל על פורט 3000"));
    