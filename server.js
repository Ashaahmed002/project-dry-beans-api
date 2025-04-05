require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors'); 

const app = express();
app.use(cors()); 
app.use(express.json());
// Test DB connection route
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ success: true, message: 'Database connection successful', time: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});


const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Root endpoint shows ALL raw data
app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM dry_beans');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Swagger setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dry Beans API',
      version: '1.0.0',
      description: 'Complete CRUD API for Dry Beans Dataset',
      contact: {
        name: "Your Name",
        email: "your.email@example.com"
      }
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: {
        Bean: {
          type: 'object',
          properties: {
            ctid: { type: 'string', description: 'PostgreSQL internal tuple ID' },
            Area: { type: 'number', example: 28395 },
            Perimeter: { type: 'number', example: 610.291 },
            MajorAxisLength: { type: 'number', example: 206.978 },
            MinorAxisLength: { type: 'number', example: 174.868 },
            AspectRation: { type: 'number', example: 1.183 },
            Eccentricity: { type: 'number', example: 0.541 },
            ConvexArea: { type: 'number', example: 28931 },
            EquivDiameter: { type: 'number', example: 190.135 },
            Extent: { type: 'number', example: 0.749 },
            Solidity: { type: 'number', example: 0.981 },
            Roundness: { type: 'number', example: 0.862 },
            Compactness: { type: 'number', example: 0.931 },
            ShapeFactor1: { type: 'number', example: 0.005 },
            ShapeFactor2: { type: 'number', example: 0.002 },
            ShapeFactor3: { type: 'number', example: 0.001 },
            ShapeFactor4: { type: 'number', example: 0.000 },
            Class: { 
              type: 'string', 
              example: 'DERMASON',
              enum: ['DERMASON', 'SIRA', 'SEKER', 'HOROZ', 'CALI', 'BARBUNYA', 'BOMBAY']
            }
          }
        },
        BeanInput: {
          type: 'object',
          properties: {
            Area: { type: 'number', example: 28395 },
            Perimeter: { type: 'number', example: 610.291 },
            MajorAxisLength: { type: 'number', example: 206.978 },
            MinorAxisLength: { type: 'number', example: 174.868 },
            AspectRation: { type: 'number', example: 1.183 },
            Eccentricity: { type: 'number', example: 0.541 },
            ConvexArea: { type: 'number', example: 28931 },
            EquivDiameter: { type: 'number', example: 190.135 },
            Extent: { type: 'number', example: 0.749 },
            Solidity: { type: 'number', example: 0.981 },
            Roundness: { type: 'number', example: 0.862 },
            Compactness: { type: 'number', example: 0.931 },
            ShapeFactor1: { type: 'number', example: 0.005 },
            ShapeFactor2: { type: 'number', example: 0.002 },
            ShapeFactor3: { type: 'number', example: 0.001 },
            ShapeFactor4: { type: 'number', example: 0.000 },
            Class: { 
              type: 'string', 
              example: 'DERMASON',
              enum: ['DERMASON', 'SIRA', 'SEKER', 'HOROZ', 'CALI', 'BARBUNYA', 'BOMBAY']
            }
          }
        }
      }
    }
  },
  apis: ['./server.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * tags:
 *   name: Beans
 *   description: Dry beans management
 */

/**
 * @swagger
 * /beans:
 *   get:
 *     tags: [Beans]
 *     summary: Get all beans
 *     description: Retrieve complete list of all beans from the database
 *     responses:
 *       200:
 *         description: Full list of all beans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bean'
 *             examples:
 *               fullDataset:
 *                 summary: Example of complete bean data
 *                 value: [
 *                   {
 *                     "ctid": "(0,1)",
 *                     "Area": 28395,
 *                     "Perimeter": 610.291,
 *                     "MajorAxisLength": 206.978,
 *                     "MinorAxisLength": 174.868,
 *                     "AspectRation": 1.183,
 *                     "Eccentricity": 0.541,
 *                     "ConvexArea": 28931,
 *                     "EquivDiameter": 190.135,
 *                     "Extent": 0.749,
 *                     "Solidity": 0.981,
 *                     "Roundness": 0.862,
 *                     "Compactness": 0.931,
 *                     "ShapeFactor1": 0.005,
 *                     "ShapeFactor2": 0.002,
 *                     "ShapeFactor3": 0.001,
 *                     "ShapeFactor4": 0.000,
 *                     "Class": "DERMASON"
 *                   },
 *                   {
 *                     "ctid": "(0,2)",
 *                     "Area": 28734,
 *                     "Perimeter": 638.018,
 *                     "MajorAxisLength": 212.396,
 *                     "MinorAxisLength": 172.265,
 *                     "AspectRation": 1.233,
 *                     "Eccentricity": 0.601,
 *                     "ConvexArea": 29322,
 *                     "EquivDiameter": 191.145,
 *                     "Extent": 0.723,
 *                     "Solidity": 0.980,
 *                     "Roundness": 0.831,
 *                     "Compactness": 0.925,
 *                     "ShapeFactor1": 0.004,
 *                     "ShapeFactor2": 0.002,
 *                     "ShapeFactor3": 0.001,
 *                     "ShapeFactor4": 0.000,
 *                     "Class": "SIRA"
 *                   }
 *                 ]
 */
app.get('/beans', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM dry_beans');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } 
});

// GET single bean
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
 *           type: string
 *         description: The bean ID (ctid)
 *     responses:
 *       200:
 *         description: Bean details
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
    const { rows } = await pool.query('SELECT * FROM dry_beans WHERE ctid = $1::text::tid', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Bean not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create new bean
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
 *             $ref: '#/components/schemas/BeanInput'
 *     responses:
 *       201:
 *         description: Bean created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bean'
 *       400:
 *         description: Invalid input
 */
app.post('/beans', async (req, res) => {
  try {
    const { Area, Perimeter, MajorAxisLength, MinorAxisLength, Class } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO dry_beans (Area, Perimeter, MajorAxisLength, MinorAxisLength, Class) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [Area, Perimeter, MajorAxisLength, MinorAxisLength, Class]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update bean
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
 *           type: string
 *         description: The bean ID (ctid)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BeanInput'
 *     responses:
 *       200:
 *         description: Bean updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bean'
 *       404:
 *         description: Bean not found
 */
app.put('/beans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Area, Perimeter, MajorAxisLength, MinorAxisLength, Class } = req.body;
    const { rows } = await pool.query(
      'UPDATE dry_beans SET Area = $1, Perimeter = $2, MajorAxisLength = $3, MinorAxisLength = $4, Class = $5 WHERE ctid = $6::text::tid RETURNING *',
      [Area, Perimeter, MajorAxisLength, MinorAxisLength, Class, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Bean not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE bean
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
 *           type: string
 *         description: The bean ID (ctid)
 *     responses:
 *       204:
 *         description: Bean deleted
 *       404:
 *         description: Bean not found
 */
app.delete('/beans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM dry_beans WHERE ctid = $1::text::tid', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Bean not found' });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Test DB connection route
app.get('/test-connection', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ success: true, message: 'Database connection successful', time: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
  console.log(`API docs: http://localhost:${process.env.PORT || 3000}/api-docs`);
  console.log(`Test Connection: http://localhost:${process.env.PORT || 3000}/test-connection`)

});