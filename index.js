const connectToMongo = require("./db");
const express = require("express");
const { routerCustomer } = require("./routes/customer");
const { routerCampaign } = require("./routes/campaign");
const cors = require("cors");

connectToMongo();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'https://saurav-sinha-3141.github.io/xeno-task-frontend',
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// Available Routes
app.use("/api/customer", routerCustomer);
app.use("/api/campaign", routerCampaign);

const ipAddress = "192.168.153.139";
const port = 5000;

app.listen(port, () => {
  console.log(`Xeno backend listening at - http://${ipAddress}:${port}`);
});
