import express from "express";
import multer from "multer";
import Joi from "joi";

import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} from "../../models/contacts.js";
import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://akvma:cKE!%5EGjmpxK!RU8PY61Y@cluster0.p9kxw5t.mongodb.net/test",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const router = express.Router();
const upload = multer();
const schemas = {
  addContact: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  }),
  updateContact: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
  }).min(1),
};

const { Schema } = mongoose;

const contactSchemas = {
  addContact: new Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
  }),
  updateContact: new Schema({
    name: { type: String, unique: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
  }),
};
// Get all contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();

    res.status(contacts.statusCcode).json(contacts);
  } catch (error) {
    next(error);
  }
});

// Get contact by ID
router.get("/:contactId", async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);

    res.status(contact.statusCode).json(contact);
  } catch (error) {
    next(error);
  }
});

// Create a new contact
router.post("/", upload.none(), async (req, res, next) => {
  try {
    let newContact;
    const { error } = schemas.addContact.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    // flexibility for using raw JSON object and form-data
    if (req.headers["content-type"].startsWith("multipart/form-data")) {
      newContact = await addContact(req.body);
    } else {
      newContact = await addContact(req.body);
    }

    newContact === null && res.status(400).json({ error: "Invalid request" });

    res.status(newContact.statusCode).json(newContact);
  } catch (error) {
    next(error);
  }
});

// Update a contact
router.put("/:contactId", upload.none(), async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const providedData = req.body;

    const { error } = schemas.updateContact.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    let updatedContact;
    if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
      updatedContact = await updateContact(contactId, providedData);
    } else {
      updatedContact = await updateContact(contactId, providedData);
    }
    res.status(updatedContact.statusCode).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

// Delete a contact
router.delete("/:contactId", async (req, res, next) => {
  try {
    const removedContact = await removeContact(req.params.contactId);
    res.status(removedContact.statusCode).json(removedContact);
  } catch (error) {
    next(error);
  }
});

export default router;
