const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["pizza", "beverages"],
  },
  customization: {
    type: Map,
    of: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    items: [orderItemSchema],
    deliveryAddress: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ["card", "cash"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    comment: {
      type: String,
      default: "",
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      taxes: {
        type: Number,
        required: true,
      },
      deliveryCharges: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    promoCode: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      required: true,
      enum: ["Received", "Confirmed", "Prepared", "Out for delivery", "Delivered", "Cancelled"],
      default: "Received",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    refund: {
      stripeRefundId: {
        type: String,
        default: null,
      },
      amount: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ["NONE", "PENDING", "COMPLETED", "FAILED"],
        default: "NONE",
      },
      refundedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
