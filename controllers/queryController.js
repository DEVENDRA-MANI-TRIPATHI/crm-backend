import {
  addQuery,
  getUserQueries,
  getAllQueries,
  getUserQueriesByStatus,
  getAllQueriesByStatus,
  updateQueryStatus,
} from '../models/queryModel.js';

// Create a new query
export const createQuery = async (req, res) => {
  const userId = req.user.id; // Extracted from the JWT token
  const { title, query_type, description } = req.body;

  if (!title || !query_type || !description) {
    return res.status(400).send('Title, query type, and description are required.');
  }

  try {
    // Ensure that user_id is not null
    if (!userId) {
      return res.status(400).send('User ID is required.');
    }

    const queryId = await addQuery(userId, title, query_type, description);
    res.status(201).send({
      message: 'Query created successfully.',
      queryId,
    });
  } catch (err) {
    console.error('Error creating query:', err.message);
    res.status(500).send('Error creating query.');
  }
};

// Get all queries for the logged-in user
export const fetchUserQueries = async (req, res) => {
  const userId = req.user.id; // Extracted from the JWT token

  try {
    const queries = await getUserQueries(userId);
    res.status(200).json(queries);
  } catch (err) {
    console.error('Error fetching user queries:', err.message);
    res.status(500).send('Error fetching queries.');
  }
};

// Get all queries (Admin view)
export const fetchAllQueries = async (req, res) => {
  try {
    const queries = await getAllQueries();
    res.status(200).json(queries);
  } catch (err) {
    console.error('Error fetching all queries:', err.message);
    res.status(500).send('Error fetching queries.');
  }
};

// Fetch user queries by status
export const fetchUserQueriesByStatus = async (req, res) => {
  const userId = req.user.id; // Extracted from the JWT token
  const { status } = req.params;

  try {
    const validStatuses = ['new', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send('Invalid query status.');
    }

    const queries = await getUserQueriesByStatus(userId, status);
    res.status(200).json(queries);
  } catch (err) {
    console.error(`Error fetching user queries with status ${status}:`, err.message);
    res.status(500).send('Error fetching queries.');
  }
};

// Fetch all queries by status (Admin view)
export const fetchAllQueriesByStatus = async (req, res) => {
  const { status } = req.params;

  try {
    const validStatuses = ['new', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send('Invalid query status.');
    }

    const queries = await getAllQueriesByStatus(status);
    res.status(200).json(queries);
  } catch (err) {
    console.error(`Error fetching all queries with status ${status}:`, err.message);
    res.status(500).send('Error fetching queries.');
  }
};

// Admin: Update the status of a query
export const updateQueryStatusByAdmin = async (req, res) => {
  const { queryId, status, amount, paymentLink } = req.body;

  // Validate the provided status
  const validStatuses = ['new', 'in_progress', 'resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).send({
      error: 'Invalid status. Valid statuses are: new, in_progress, resolved.'
    });
  }

  try {
    if (status === 'in_progress') {
      // Validate amount and payment link when status is 'in_progress'
      if (amount === undefined || isNaN(amount) || !paymentLink) {
        return res.status(400).send({
          error: 'Amount and payment link are required and must be valid when changing status to in_progress.'
        });
      }

      // Update status, amount, and payment link
      const result = await updateQueryStatus(queryId, status, amount, paymentLink);

      if (result.affectedRows > 0) {
        return res.status(200).send({
          message: 'Query status, amount, and payment link updated successfully.',
          paymentLink: paymentLink || null
        });
      } else {
        return res.status(404).send({
          error: 'Query not found.'
        });
      }
    } else if (status === 'resolved') {
      // Only update the status to 'resolved'
      const result = await updateQueryStatus(queryId, status);

      if (result.affectedRows > 0) {
        return res.status(200).send({
          message: 'Query status updated to resolved successfully.'
        });
      } else {
        return res.status(404).send({
          error: 'Query not found.'
        });
      }
    } else {
      return res.status(400).send({
        error: 'No additional action required for the selected status.'
      });
    }
  } catch (err) {
    console.error('Error updating query status:', err.message);
    return res.status(500).send({
      error: 'Error updating query status.'
    });
  }
};


// Example function to update the query in the database
// async function updateQueryStatus(queryId, status, amount, paymentLink) {
//   // Replace this with your actual database update query
//   const sql = `
//     UPDATE queries 
//     SET status = ?, amount = ?, payment_link = ?
//     WHERE id = ?
//   `;
//   const params = [status, amount, paymentLink, queryId];
//   return db.execute(sql, params);
// }
