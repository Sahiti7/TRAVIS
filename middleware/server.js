const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/vista_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Customer schema
const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String
});

const Customer = mongoose.model('Customer', customerSchema);

// Account schema
const accountSchema = new mongoose.Schema({
  name: String,
  accountNumber: String,
  password: String
});

const Account = mongoose.model('Account', accountSchema);

// Register route
app.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new Customer({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Customer.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Account creation route
app.post('/account-details', async (req, res) => {
  const { name, accountNumber, password } = req.body;

  try {
    const existing = await Account.findOne({ accountNumber });
    if (existing) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAccount = new Account({
      name,
      accountNumber,
      password: hashedPassword
    });

    await newAccount.save();

    res.status(201).json({ message: 'Account details saved' });
  } catch (error) {
    console.error('Error saving account details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ NEW: Account verification route
app.post('/account-details/verify', async (req, res) => {
  const { name, accountNumber, password } = req.body;

  try {
    const user = await Account.findOne({ name, accountNumber });

    if (!user) {
      return res.status(401).json({ message: 'Account not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'Account verified' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
