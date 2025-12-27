const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["pizza", "beverages"],
    },
    image: {
      type: String,
      default: "",
    },
    pricing: {
      // For Pizza: { small: 400, medium: 500, large: 600, thin: 50, thick: 100 }
      // For Beverages: { ml100: 20, ml330: 40, ml500: 60, warm: 0, cold: 10 }
      type: Map,
      of: Number,
      required: true,
    },
    toppings: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
      },
    ],
    attributes: {
      isHit: {
        type: Boolean,
        default: false,
      },
      spiciness: {
        type: String,
        enum: ["non-spicy", "spicy"],
        default: "non-spicy",
      },
      alcohol: {
        type: String,
        enum: ["non-alcoholic", "alcoholic"],
        default: "non-alcoholic",
      },
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
