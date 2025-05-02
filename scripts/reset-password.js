import bcrypt from 'bcrypt';
import pg from 'pg';
const { Pool } = pg;

async function resetPassword() {
  try {
    // Connect to the database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Update the user's password directly in the database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, 'sbah']
    );
    
    if (result.rowCount > 0) {
      console.log('Password for "sbah" has been reset to "password123"');
    } else {
      console.log('User "sbah" not found');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();