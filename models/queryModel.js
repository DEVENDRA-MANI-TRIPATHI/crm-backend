import db from '../config/dbConfig.js';

// Create the `queries` table if it doesn't exist
const createQueryTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS queries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      query_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('new', 'in_progress', 'resolved') DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  db.query(sql, (err) => {
    if (err) {
      console.error('Error creating queries table:', err.message);
    } else {
      console.log('Queries table ensured.');
    }
  });
};
createQueryTable();
// Add a new query to the database
export const addQuery = (userId, title, queryType, description) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO queries (user_id, title, query_type, description) 
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [userId, title, queryType, description], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.insertId);
      }
    });
  });
};

// Get all queries for a specific user
export const getUserQueries = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, title, query_type, description, status, created_at 
      FROM queries 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    db.query(sql, [userId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Get all queries for a user by status
export const getUserQueriesByStatus = (userId, status) => {
  return new Promise((resolve, reject) => {
    // Base SQL query
    let sql = `
      SELECT id, title, query_type, description, status, created_at
    `;

    // Add `amount` and `payment_link` only for specific statuses
    if (status === 'in_progress' || status === 'resolved') {
      sql += `, amount, payment_link `;
    }

    sql += `
      FROM queries 
      WHERE user_id = ? AND status = ? 
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId, status], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Get all queries (Admin view)
// Get all queries for admin, including user details and optional amount and payment link
export const getAllQueries = () => {
  return new Promise((resolve, reject) => {
    // Base SQL query
    let sql = `
      SELECT q.id, q.title, q.query_type, q.description, q.status, q.created_at, u.name, u.email
    `;

    // Add `amount` and `payment_link` for specific statuses
    sql += `, 
      CASE 
        WHEN q.status IN ('in_progress', 'resolved') THEN q.amount 
        ELSE NULL 
      END AS amount,
      CASE 
        WHEN q.status IN ('in_progress', 'resolved') THEN q.payment_link 
        ELSE NULL 
      END AS payment_link
    `;

    sql += `
      FROM queries q 
      JOIN users u ON q.user_id = u.id 
      ORDER BY q.created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};


// Get all queries by status (Admin view)
export const getAllQueriesByStatus = (status) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT q.id, q.title, q.query_type, q.description, q.status, q.created_at, u.name, u.email 
      FROM queries q 
      JOIN users u ON q.user_id = u.id 
      WHERE q.status = ? 
      ORDER BY q.created_at DESC
    `;
    db.query(sql, [status], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Update the status of a query by id


export const updateQueryStatus = (queryId, status, amount = null, paymentLink = null) => {
  return new Promise((resolve, reject) => {
    let sql, params;

    if (status === 'in_progress') {
      sql = `
        UPDATE queries
        SET status = ?, amount = ?, payment_link = ?
        WHERE id = ?
      `;
      params = [status, amount, paymentLink, queryId];
    } else {
      sql = `
        UPDATE queries
        SET status = ?
        WHERE id = ?
      `;
      params = [status, queryId];
    }

    db.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};



