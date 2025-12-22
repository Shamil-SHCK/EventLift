import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, clubName, organizationName, formerInstitution } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role,
    };

    if (req.file) {
      userData.verificationDocument = req.file.path.replace(/\\/g, "/");
    }

    // Add conditional fields based on role
    // Using correct role strings from enum
    if (role === 'club-admin' && clubName) {
      userData.clubName = clubName;
    }

    if (role === 'company' && organizationName) {
      userData.organizationName = organizationName;
    }

    if (role === 'alumni-individual' && formerInstitution) {
      userData.formerInstitution = formerInstitution;
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubName: user.clubName,
        organizationName: user.organizationName,
        formerInstitution: user.formerInstitution,
        verificationStatus: user.verificationStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clubName: user.clubName,
        organizationName: user.organizationName,
        formerInstitution: user.formerInstitution,
        verificationStatus: user.verificationStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      clubName: user.clubName,
      organizationName: user.organizationName,
      formerInstitution: user.formerInstitution,
      verificationStatus: user.verificationStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'clubName', 'organizationName', 'formerInstitution',
      'phone', 'logoUrl', 'description'
    ];

    // Filter req.body to only allow specific fields to be updated
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      clubName: user.clubName,
      organizationName: user.organizationName,
      formerInstitution: user.formerInstitution,
      verificationStatus: user.verificationStatus,
      phone: user.phone,
      logoUrl: user.logoUrl,
      description: user.description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
