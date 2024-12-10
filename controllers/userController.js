import db from '../config/dbConfig.js';

// Get all users
export const getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (error, results) => {
        if (error) {
            console.error('Error fetching users:', error.message);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.json(results);
    });
};

// Get user by ID
export const getUserById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
        if (error || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
};

// Update user
export const updateUser = (req, res) => {
    const { id } = req.params;
    const { name, email, location, address, contact_number } = req.body;

    db.query(
        'UPDATE users SET name = ?, email = ?, location = ?, address = ?, contact_number = ? WHERE id = ?',
        [name, email, location, address, contact_number, id],
        (error, results) => {
            if (error) {
                console.error('Error updating user:', error.message);
                return res.status(500).json({ error: 'Failed to update user' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User updated successfully' });
        }
    );
};

// Delete user
export const deleteUser = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error deleting user:', error.message);
            return res.status(500).json({ error: 'Failed to delete user' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
};
