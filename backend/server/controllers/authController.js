import User from '../models/User.js';
import PendingUser from '../models/PendingUser.js';
// import Profile from '../models/Profile.js';
import AlumniProfile from '../models/AlumniProfile.js';
import ClubProfile from '../models/ClubProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { getUserProfile, createUserProfile } from '../utils/UserProfilesHandler.js';
import crypto from 'crypto';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, clubName, collegeName, organizationName, formerInstitution } = req.body;

    // Validate role-specific required fields
    if (role === 'club-admin' && (!clubName || !collegeName)) {
      return res.status(400).json({ message: 'Club Name and College Name are required for Club Admins' });
    }
    if (role === 'company' && !organizationName) {
      return res.status(400).json({ message: 'Organization Name is required for Company accounts' });
    }
    if (role === 'alumni-individual' && !formerInstitution) {
      return res.status(400).json({ message: 'Former Institution is required for Alumni accounts' });
    }

    // Check if user already exists in main User collection
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if user has a pending verification and remove it to allow retry
    await PendingUser.deleteOne({ email });

    // Create pending user object
    const userData = {
      name,
      email,
      password, // Plain text, will be hashed when moved to User model
      role
    };

    if (req.file) {
      userData.verificationDocument = req.file.path;
    }

    // Add conditional fields based on role
    if (role === 'club-admin' && clubName) {
      userData.clubName = clubName;
      if (collegeName) {
        userData.collegeName = collegeName;
      }
    }

    if (role === 'company' && organizationName) {
      userData.organizationName = organizationName;
    }

    if (role === 'alumni-individual' && formerInstitution) {
      userData.formerInstitution = formerInstitution;
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    userData.otp = otpHash;
    userData.otpExpire = otpExpire;

    // Create pending user
    const pendingUser = await PendingUser.create(userData);

    if (pendingUser) {
      try {
        await sendEmail({
          email: pendingUser.email,
          subject: 'EventLift - Email Verification (OTP)',
          message: `Your verification code is: ${otp}. It expires in 10 minutes.`,
        });

        res.status(201).json({
          success: true,
          message: 'OTP sent to email. Please verify to complete registration.',
          email: pendingUser.email
        });
      } catch (emailError) {
        await PendingUser.findByIdAndDelete(pendingUser._id); // Rollback
        console.error("Email send error:", emailError);
        return res.status(500).json({ message: 'Email could not be sent' });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find in PendingUser
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({ message: 'User not found or registration expired. Please register again.' });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // if (pendingUser.otp !== otpHash || pendingUser.otpExpire < Date.now()) {
    //   return res.status(400).json({ message: 'Invalid or expired OTP' });
    // }

    // Move from PendingUser to User
    const userData = {
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // This will be hashed by User model
      role: pendingUser.role,
      isEmailVerified: true,
      verificationStatus: 'pending',
      clubName: pendingUser.clubName,
      collegeName: pendingUser.collegeName,
      organizationName: pendingUser.organizationName,
      formerInstitution: pendingUser.formerInstitution,
      verificationDocument: pendingUser.verificationDocument,
      phone: pendingUser.phone,
      logoUrl: pendingUser.logoUrl,
      description: pendingUser.description
    };

    // Check if a user with this email already exists (Ghost user from failed verification)
    const existingUser = await User.findOne({ email: pendingUser.email });
    if (existingUser) {
      await User.findByIdAndDelete(existingUser._id);
    }
    // Also cleanup any orphaned profiles to prevent duplicate key errors
    await ClubProfile.deleteOne({ email: pendingUser.email });
    await CompanyProfile.deleteOne({ email: pendingUser.email });
    await AlumniProfile.deleteOne({ email: pendingUser.email });

    // Create new user in main collection (Essentials only)
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      isEmailVerified: true,
      verificationStatus: 'pending',
      verificationDocument: pendingUser.verificationDocument,
    });

    // Create Profile with detailed info
    let profile = await createUserProfile(pendingUser, user._id);
    // if(pendingUser.role ==='club-admin'){
    //     profile = await ClubProfile.create({
    //     user: user._id,
    //     name: pendingUser.name,
    //     email:pendingUser.email,
    //     clubName: pendingUser.clubName,
    //     collegeName: pendingUser.collegeName
    //   });
    // }
    // if(pendingUser.role ==='company'){
    //    profile = await CompanyProfile.create({
    //     user: user._id,
    //     name: pendingUser.name,
    //     email:pendingUser.email,
    //     organizationName: pendingUser.organizationName
    //   });
    // }
    // if(pendingUser.role ==='alumni-individual'){
    //    profile = await AlumniProfile.create({
    //     user: user._id,
    //     name: pendingUser.name,
    //     email: pendingUser.email,
    //     formerInstitution: pendingUser.formerInstitution
    //   });
    // }

    console.log("profile created")
    console.log(profile)

    if (!profile) {
      // Rollback user creation if profile failed (optional but good practice)
      await User.findByIdAndDelete(user._id);
      throw new Error('Failed to create user profile');
    }

    // Link profile to user
    user.profile = profile._id;
    if (user.role === 'club-admin') user.profileType = 'ClubProfile';
    else if (user.role === 'company') user.profileType = 'CompanyProfile';
    else if (user.role === 'alumni-individual') user.profileType = 'AlumniProfile';

    await user.save();

    // Calculate token
    const token = generateToken(user._id);

    // Delete pending user
    await PendingUser.findByIdAndDelete(pendingUser._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      // Spread profile properties for frontend compatibility
      clubName: profile.clubName,
      collegeName: profile.collegeName,
      organizationName: profile.organizationName,
      formerInstitution: profile.formerInstitution,
      verificationStatus: user.verificationStatus,
      token: token,
      verificationDocument: profile.verificationDocument || null,
      occupation: profile.occupation,
      organizationName: profile.organizationName,
    });

  } catch (error) {
    console.error(error);
    // Rollback: Attempt to delete the user if it was created but the process failed (and wasn't caught earlier)
    if (req.body.email) {
      try {
        const ghostUser = await User.findOne({ email: req.body.email });
        // Ensure we only delete if it was just created (optional: check createdAt) - but for now, email uniqueness implies it's the one we failed to fully setup.
        // Actually, we check if it is verified or not. If it is verified, we shouldn't delete active users. 
        // But verifyOTP is for new users. 
        if (ghostUser) {
          await User.findByIdAndDelete(ghostUser._id);
          console.log("Rolled back ghost user:", req.body.email);
        }
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    }
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
    const user = await User.findOne({ email }).select('+password -verificationDocument');

    if (user && (await user.matchPassword(password))) {
      // With the new flow, isEmailVerified should always be true for users in the main DB,
      // but we keep the check for robustness / legacy support.
      // if (user.isEmailVerified === false) {
      //   return res.status(401).json({ message: 'Please verify your email to log in.' });
      // }

      // Populate profile to return merged data
      await user.populate('profile');

      const profile = user.profile || {};

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        verificationStatus: user.verificationStatus,
        token: generateToken(user._id),
        // Spread profile fields
        clubName: profile.clubName,
        collegeName: profile.collegeName,
        organizationName: profile.organizationName,
        formerInstitution: profile.formerInstitution,
        phone: profile.phone,
        logoUrl: profile.logoUrl,
        description: profile.description,
        occupation: profile.occupation,
        organizationName: profile.organizationName,
        sponseredEvents: profile.sponseredEvents || []
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
    const user = await User.findById(req.user._id).select('-verificationDocument -password').populate('profile');
    console.log(user.role)
    const profile = await getUserProfile(user);
    console.log(profile)
    if (user.role === 'administrator') {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        verificationStatus: user.verificationStatus,
        profile: user.profile,
      });
    }
    res.json({
      _id: user._id,
      name: profile.name,
      email: user.email,
      username: user.username,
      role: user.role,
      verificationStatus: user.verificationStatus,
      profile: user.profile,
      // Profile fields

      clubName: (profile.clubName) ? profile.clubName : "",
      collegeName: profile.collegeName,
      organizationName: profile.organizationName,
      formerInstitution: profile.formerInstitution,
      phone: profile.phone,
      logoUrl: profile.logoUrl,
      description: profile.description,
      occupation: profile.occupation,
      organizationName: profile.organizationName,
      sponseredEvents: profile.sponseredEvents || []
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
      'clubName', 'collegeName', 'organizationName', 'formerInstitution',
      'phone', 'logoUrl', 'description', 'team', 'achievements',
      'occupation', 'organizationName'
    ];

    // Filter req.body to only allow specific fields to be updated
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Ensure profile record exists and user.profile reference is set
    let user = await User.findById(req.user._id);
    let profile = await getUserProfile(user);
    if (!user.profile) {
      user.profile = profile._id;
      await user.save();
    }


    //find the user to update the profile
    user = await User.findById(req.user._id).select('-password');

    // find profile by roles
    if (user.role === "club-admin") {
      profile = await ClubProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: updates },
        { new: true, upsert: true }
      );
    }
    if (user.role === "alumni-individual") {
      profile = await AlumniProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: updates },
        { new: true, upsert: true }
      );
    }
    if (user.role === "company") {
      profile = await CompanyProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: updates },
        { new: true, upsert: true }
      );
    }



    // const profile = await Profile.findOneAndUpdate(
    //   { user: req.user._id },
    //   { $set: updates },
    //   { new: true, upsert: true }
    // );

    // Fetch refreshed user info
    user = await User.findById(req.user._id).select('-password');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      // Merged profile
      clubName: profile.clubName,
      collegeName: profile.collegeName,
      organizationName: profile.organizationName,
      formerInstitution: profile.formerInstitution,
      phone: profile.phone,
      logoUrl: profile.logoUrl,
      description: profile.description,
      occupation: profile.occupation,
      organizationName: profile.organizationName,
      sponseredEvents: profile.sponseredEvents || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload a single logo/photo to Cloudinary and return URL
// @route   POST /api/auth/upload-logo
// @access  Private
export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // multer-storage-cloudinary places the Cloudinary secure URL in req.file.path
    return res.json({ url: req.file.path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
