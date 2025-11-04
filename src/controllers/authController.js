import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

export async function register(req, res, next) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // cek duplikat
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // ✅ Cek apakah password dan confirmPassword cocok
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // ✅ Cek duplikat email & username
    if (await User.emailExists(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    if (await User.usernameExists(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    // create user (model sudah melakukan hash di method create milikmu,
    // tapi kalau create tidak meng-hash, uncomment 2 baris di bawah)
    // const hashed = await bcrypt.hash(password, 10);
    // const userId = await User.create({ username, email, password: hashed });

    const userId = await User.create({ username, email, password }); // sesuai method kamu

    const token = signToken(userId);
    return res.status(201).json({
      success: true,
      token,
      user: { id: userId, username, email },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await User.verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    return res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    delete user.password;

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
}


export async function updateProfile(req, res, next) {
  try {
    const { username, email } = req.body;

    // optional: cek kalau email/username mau diubah, pastikan tidak dipakai user lain
    if (email) {
      const existing = await User.findByEmail(email);
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }
    if (username) {
      const existing = await User.findByUsername(username);
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ success: false, message: 'Username already in use' });
      }
    }

    const ok = await User.update(req.user.id, { username, email });
    if (!ok) return res.status(404).json({ success: false, message: 'User not found' });

    const user = await User.findById(req.user.id);
    delete user.password;
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const valid = await User.verifyPassword(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.update(req.user.id, { password: hashed });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const ok = await User.delete(req.user.id);
    if (!ok) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export default {
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
};
