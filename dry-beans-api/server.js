require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Database pool with enhanced configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Improved SQL file execution with error handling
async function runSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(path.resolve(__dirname, filePath)).toString();
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log('SQL file executed successfully');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error executing SQL file:', err.stack);
  }
}

// Enhanced DB connection test
app.get('/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW() as time, pg_database_size($1) as db_size', [process.env.DB_NAME]);
      res.status(200).json({ 
        success: true, 
        message: 'Database connection successful',
        time: result.rows[0].time,
        db_size: result.rows[0].db_size
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Optimized root endpoint
app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT id, bean_class FROM dry_beans LIMIT 100');
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Root endpoint error:', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// Enhanced Swagger setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dry Beans API',
      version: '1.0.0',
      description: 'Optimized CRUD API for Dry Beans Dataset',
      contact: {
        name: "API Support",
        email: "support@beansapi.com"
      }
    },
    servers: [{ 
      url: 'http://localhost:3000',
      description: 'Development server'
    }],
    components: {
      schemas: {
        Bean: {
          type: 'object',
          required: ['bean_class'],
          properties: {
            id: { 
              type: 'integer', 
              description: 'Auto-generated bean ID',
              readOnly: true
            },
            area: { type: 'number', format: 'float', example: 28395 },
            perimeter: { type: 'number', format: 'float', example: 610.291 },
            major_axis_length: { type: 'number', format: 'float', example: 208.178 },
            minor_axis_length: { type: 'number', format: 'float', example: 173.889 },
            aspect_ratio: { type: 'number', format: 'float', example: 1.197 },
            eccentricity: { 
              type: 'number', 
              format: 'float',
              minimum: 0,
              maximum: 1,
              example: 0.550 
            },
            convex_area: { type: 'number', format: 'float', example: 28715 },
            equiv_diameter: { type: 'number', format: 'float', example: 190.141 },
            extent: { 
              type: 'number', 
              format: 'float',
              minimum: 0,
              maximum: 1,
              example: 0.764 
            },
            solidity: { 
              type: 'number', 
              format: 'float',
              minimum: 0,
              maximum: 1,
              example: 0.989 
            },
            roundness: { 
              type: 'number', 
              format: 'float',
              minimum: 0,
              maximum: 1,
              example: 0.958 
            },
            compactness: { 
              type: 'number', 
              format: 'float',
              minimum: 0,
              maximum: 1,
              example: 0.913 
            },
            shape_factor1: { type: 'number', format: 'float', example: 0.007 },
            shape_factor2: { type: 'number', format: 'float', example: 0.003 },
            shape_factor3: { type: 'number', format: 'float', example: 0.834 },
            shape_factor4: { type: 'number', format: 'float', example: 0.999 },
            bean_class: { 
              type: 'string', 
              example: 'SEKER',
              enum: ['DERMASON', 'SIRA', 'SEKER', 'HOROZ', 'CALI', 'BARBUNYA', 'BOMBAY']
            },
            created_at: { 
              type: 'string', 
              format: 'date-time',
              readOnly: true
            },
            updated_at: { 
              type: 'string', 
              format: 'date-time',
              readOnly: true
            }
          }
        }
      }
    }
  },
  apis: ['./server.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
}));

/**
 * @swagger
 * tags:
 *   name: Beans
 *   description: Efficient dry beans management
 */

// Enhanced GET beans endpoint with filtering and pagination
/**
 * @swagger
 * /beans:
 *   get:
 *     tags: [Beans]
 *     summary: Get list of beans with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: bean_class
 *         schema:
 *           type: string
 *           enum: ['DERMASON', 'SIRA', 'SEKER', 'HOROZ', 'CALI', 'BARBUNYA', 'BOMBAY']
 *         description: Filter by bean class
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (optional)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (optional)
 *     responses:
 *       200:
 *         description: List of beans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bean'
 */
app.get('/beans', async (req, res) => {
  try {
    const { bean_class, page, limit } = req.query;
    
    let queryText = 'SELECT * FROM dry_beans';
    let values = [];
    let paramCount = 1;

    if (bean_class) {
      queryText += ' WHERE bean_class = $1';
      values.push(bean_class);
      paramCount++;
    }

    queryText += ' ORDER BY id';

    if (page && limit) {
      const offset = (page - 1) * limit;
      queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      values.push(limit, offset);
    }

    const client = await pool.connect();
    try {
      const { rows } = await client.query(queryText, values);
      res.json(rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('GET /beans error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single bean with caching headers
/**
 * @swagger
 * /beans/{id}:
 *   get:
 *     tags: [Beans]
 *     summary: Get a bean by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The bean ID
 *     responses:
 *       200:
 *         description: Bean details
 *         headers:
 *           Cache-Control:
 *             schema:
 *               type: string
 *             description: Cache control header
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bean'
 *       404:
 *         description: Bean not found
 */
app.get('/beans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        'SELECT * FROM dry_beans WHERE id = $1', 
        [id]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Bean not found' });
      }
      
      res.set('Cache-Control', 'public, max-age=3600');
      res.json(rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`GET /beans/${req.params.id} error:`, err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fixed POST endpoint with transaction and validation
/**
 * @swagger
 * /beans:
 *   post:
 *     tags: [Beans]
 *     summary: Create a new bean
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bean'
 *     responses:
 *       201:
 *         description: Bean created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bean'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
app.post('/beans', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Validate required fields
    if (!req.body.bean_class) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'bean_class is required' });
    }

    // Numeric field validation
    const numericFields = [
      'area', 'perimeter', 'major_axis_length', 'minor_axis_length', 'aspect_ratio',
      'eccentricity', 'convex_area', 'equiv_diameter', 'extent',
      'solidity', 'roundness', 'compactness', 'shape_factor1',
      'shape_factor2', 'shape_factor3', 'shape_factor4'
    ];
    
    for (const field of numericFields) {
      if (req.body[field] && isNaN(Number(req.body[field]))) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `${field} must be a number` });
      }
    }

    // Insert with all available fields
    const queryText = `
      INSERT INTO dry_beans (
        ${Object.keys(req.body).join(', ')}
      ) VALUES (
        ${Object.keys(req.body).map((_, i) => `$${i+1}`).join(', ')}
      ) RETURNING *
    `;
    
    const values = Object.values(req.body);
    const { rows } = await client.query(queryText, values);
    
    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /beans error:', err.stack);
    
    if (err.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Bean with this ID already exists' });
    } else if (err.code === '23502') { // Not null violation
      res.status(400).json({ error: 'Missing required field' });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        detail: err.message 
      });
    }
  } finally {
    client.release();
  }
});

// PUT update bean with optimistic locking
/**
 * @swagger
 * /beans/{id}:
 *   put:
 *     tags: [Beans]
 *     summary: Update a bean
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The bean ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bean'
 *     responses:
 *       200:
 *         description: Bean updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bean'
 *       404:
 *         description: Bean not found
 *       409:
 *         description: Version conflict
 */
app.put('/beans/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const updateFields = Object.keys(req.body)
      .filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
    
    if (updateFields.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const setClause = updateFields
      .map((key, i) => `${key} = $${i+1}`)
      .join(', ');
    
    const values = [
      ...updateFields.map(key => req.body[key]),
      id
    ];
    
    const queryText = `
      UPDATE dry_beans 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${updateFields.length + 1}
      RETURNING *
    `;
    
    const { rows } = await client.query(queryText, values);
    
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Bean not found' });
    }
    
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`PUT /beans/${req.params.id} error:`, err.stack);
    
    if (err.code === '23505') {
      res.status(409).json({ error: 'Update would create duplicate data' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  } finally {
    client.release();
  }
});

// DELETE bean with confirmation
/**
 * @swagger
 * /beans/{id}:
 *   delete:
 *     tags: [Beans]
 *     summary: Delete a bean
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The bean ID
 *     responses:
 *       204:
 *         description: Bean deleted
 *       404:
 *         description: Bean not found
 */
app.delete('/beans/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { rowCount } = await client.query(
      'DELETE FROM dry_beans WHERE id = $1',
      [id]
    );
    
    if (rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Bean not found' });
    }
    
    await client.query('COMMIT');
    res.status(204).end();
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`DELETE /beans/${req.params.id} error:`, err.stack);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Test connection endpoint
app.get('/test-connection', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server connection test successful',
    endpoints: {
      docs: '/api-docs',
      beans: '/beans',
      testDb: '/test-db'
    }
  });
});

// Server startup with enhanced database data retrieval
app.listen(process.env.PORT || 3000, async () => {
  const port = process.env.PORT || 3000;
  const serverUrl = `http://localhost:${port}`;
  
  console.log(`Server running on ${serverUrl}`);
  console.log(`API docs: ${serverUrl}/api-docs`);
  console.log(`Test Connection: ${serverUrl}/test-connection`);
  
  // Run database optimization script
  await runSqlFile('./database/database.sql');
  
  // Retrieve and log detailed data from PostgreSQL
  try {
    const client = await pool.connect();
    try {
      // Get total count
      const countResult = await client.query('SELECT COUNT(*) FROM dry_beans');
      const totalBeans = countResult.rows[0].count;
      
      // Get distinct classes count
      const classesResult = await client.query('SELECT COUNT(DISTINCT bean_class) FROM dry_beans');
      const distinctClasses = classesResult.rows[0].count;
      
      // Get count per class
      const classCountsResult = await client.query(`
        SELECT bean_class, COUNT(*) as count 
        FROM dry_beans 
        GROUP BY bean_class 
        ORDER BY count DESC
      `);
      
      console.log('\nDatabase Statistics:');
      console.log(`- Total beans: ${totalBeans}`);
      console.log(`- Distinct classes: ${distinctClasses}`);
      console.log('- Beans per class:');
      classCountsResult.rows.forEach(row => {
        console.log(`  - ${row.bean_class}: ${row.count}`);
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('\nError retrieving initial database data:', err);
  }
});