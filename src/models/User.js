import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  /**
   * Membuat user baru
   */
  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      'INSERT INTO tb_users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Buat statistik awal untuk user
    await db.execute('INSERT INTO tb_user_statistics (user_id) VALUES (?)', [result.insertId]);

    return result.insertId;
  }

  /**
   * Cari user berdasarkan email
   */
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM tb_users WHERE email = ?', [email]);
    return rows[0];
  }

  /**
   * Cari user berdasarkan username
   */
  static async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM tb_users WHERE username = ?', [username]);
    return rows[0];
  }

  /**
   * Cari user berdasarkan ID
   */
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, email, created_at FROM tb_users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  /**
   * Verifikasi password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user data
   */
  static async update(id, data) {
    const fields = [];
    const values = [];

    if (data.username) {
      fields.push('username = ?');
      values.push(data.username);
    }

    if (data.email) {
      fields.push('email = ?');
      values.push(data.email);
    }

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE tb_users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete user
   */
  static async delete(id) {
    const [result] = await db.execute('DELETE FROM tb_users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Cek apakah email sudah ada
   */
  static async emailExists(email) {
    const [rows] = await db.execute('SELECT id FROM tb_users WHERE email = ?', [email]);
    return rows.length > 0;
  }

  /**
   * Cek apakah username sudah ada
   */
  static async usernameExists(username) {
    const [rows] = await db.execute('SELECT id FROM tb_users WHERE username = ?', [username]);
    return rows.length > 0;
  }
}

export default User;
