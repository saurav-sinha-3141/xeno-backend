const mongoose = require("mongoose");
const { Schema } = mongoose;

const CampaignSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    query: {
      type: Object,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "campaigninfo",
    timestamps: true,
  }
);

module.exports = mongoose.model("campaigninfo", CampaignSchema);
