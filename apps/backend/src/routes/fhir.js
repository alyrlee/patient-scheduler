// src/routes/fhir.js - FHIR R4 endpoints
import express from 'express';
import { openDb } from '../db.js';
import { toPractitioner, toPatient, toAppointment, fromAppointment, createBundle, createOperationOutcome } from '../fhir/mappers.js';

const router = express.Router();
const db = openDb();

// Middleware to set FHIR content type
router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/fhir+json');
  next();
});

/**
 * GET /fhir/metadata - CapabilityStatement
 */
router.get('/metadata', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}/fhir`;
  const capabilityStatement = {
    resourceType: "CapabilityStatement",
    status: "active",
    fhirVersion: "4.0.1",
    format: ["json"],
    rest: [{
      mode: "server",
      resource: [
        { 
          type: "Practitioner", 
          interaction: [
            { code: "read" }, 
            { code: "search-type" }
          ] 
        },
        { 
          type: "Appointment", 
          interaction: [
            { code: "read" }, 
            { code: "search-type" }, 
            { code: "create" }
          ] 
        },
        { 
          type: "Patient", 
          interaction: [
            { code: "read" }, 
            { code: "search-type" }
          ] 
        }
      ]
    }],
    implementation: { 
      url: base, 
      description: "Patient Scheduler FHIR facade" 
    }
  };
  res.json(capabilityStatement);
});

/**
 * GET /fhir/Practitioner - List practitioners
 */
router.get('/Practitioner', (req, res) => {
  try {
    const providers = db.prepare(`
      SELECT * FROM providers 
      ORDER BY rating DESC
    `).all();

    const entries = providers.map(provider => ({
      resource: toPractitioner(provider)
    }));

    const bundle = createBundle(entries, entries.length, `${req.protocol}://${req.get('host')}`);
    res.json(bundle);
  } catch (error) {
    console.error('FHIR Practitioner error:', error);
    const operationOutcome = createOperationOutcome('error', 'exception', 'Failed to retrieve practitioners');
    res.status(500).json(operationOutcome);
  }
});

/**
 * GET /fhir/Practitioner/:id - Get specific practitioner
 */
router.get('/Practitioner/:id', (req, res) => {
  try {
    const provider = db.prepare(`
      SELECT * FROM providers WHERE id = ?
    `).get(req.params.id);

    if (!provider) {
      const operationOutcome = createOperationOutcome('error', 'not-found', 'Practitioner not found');
      return res.status(404).json(operationOutcome);
    }

    const practitioner = toPractitioner(provider);
    res.json(practitioner);
  } catch (error) {
    console.error('FHIR Practitioner by ID error:', error);
    const operationOutcome = createOperationOutcome('error', 'exception', 'Failed to retrieve practitioner');
    res.status(500).json(operationOutcome);
  }
});

/**
 * GET /fhir/Patient - List patients
 */
router.get('/Patient', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT * FROM users 
      ORDER BY created_at DESC
    `).all();

    const entries = users.map(user => ({
      resource: toPatient(user)
    }));

    const bundle = createBundle(entries, entries.length, `${req.protocol}://${req.get('host')}`);
    res.json(bundle);
  } catch (error) {
    console.error('FHIR Patient error:', error);
    const operationOutcome = createOperationOutcome('error', 'exception', 'Failed to retrieve patients');
    res.status(500).json(operationOutcome);
  }
});

/**
 * GET /fhir/Patient/:id - Get specific patient
 */
router.get('/Patient/:id', (req, res) => {
  try {
    const user = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(req.params.id);

    if (!user) {
      const operationOutcome = createOperationOutcome('error', 'not-found', 'Patient not found');
      return res.status(404).json(operationOutcome);
    }

    const patient = toPatient(user);
    res.json(patient);
  } catch (error) {
    console.error('FHIR Patient by ID error:', error);
    const operationOutcome = createOperationOutcome('error', 'exception', 'Failed to retrieve patient');
    res.status(500).json(operationOutcome);
  }
});

/**
 * GET /fhir/Appointment - Search appointments
 */
router.get('/Appointment', (req, res) => {
  try {
    const { patient, practitioner, _count = '20', _page = '1' } = req.query;
    
    const take = Math.min(parseInt(_count, 10), 100);
    const page = Math.max(parseInt(_page, 10), 1);
    const offset = (page - 1) * take;

    let whereClause = '';
    let params = [];

    if (patient) {
      const patientId = patient.split('/').pop();
      whereClause += ' AND a.patient_id = ?';
      params.push(patientId);
    }

    if (practitioner) {
      const practitionerId = practitioner.split('/').pop();
      whereClause += ' AND a.provider_id = ?';
      params.push(practitionerId);
    }

    const appointments = db.prepare(`
      SELECT a.*, p.doctor, p.location, u.name as patient_name
      FROM appointments a 
      JOIN providers p ON p.id = a.provider_id
      LEFT JOIN users u ON u.id = a.patient_id
      WHERE 1=1 ${whereClause}
      ORDER BY datetime(a.start) DESC
      LIMIT ? OFFSET ?
    `).all(...params, take, offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count
      FROM appointments a 
      WHERE 1=1 ${whereClause}
    `).get(...params)?.count || 0;

    const entries = appointments.map(appointment => ({
      resource: toAppointment(appointment)
    }));

    const bundle = createBundle(entries, total, `${req.protocol}://${req.get('host')}`);
    res.json(bundle);
  } catch (error) {
    console.error('FHIR Appointment search error:', error);
    const operationOutcome = createOperationOutcome('error', 'exception', 'Failed to search appointments');
    res.status(500).json(operationOutcome);
  }
});

/**
 * GET /fhir/Appointment/:id - Get specific appointment
 */
router.get('/Appointment/:id', (req, res) => {
  try {
    const appointment = db.prepare(`
      SELECT a.*, p.doctor, p.location, u.name as patient_name
      FROM appointments a 
      JOIN providers p ON p.id = a.provider_id
      JOIN users u ON u.id = a.patient_id
      WHERE a.id = ?
    `).get(req.params.id);

    if (!appointment) {
      const operationOutcome = createOperationOutcome('error', 'not-found', 'Appointment not found');
      return res.status(404).json(operationOutcome);
    }

    const fhirAppointment = toAppointment(appointment);
    res.json(fhirAppointment);
  } catch (error) {
    console.error('FHIR Appointment by ID error:', error);
    const operationOutcome = createOperationOutcome('error', 'exception', 'Failed to retrieve appointment');
    res.status(500).json(operationOutcome);
  }
});

/**
 * POST /fhir/Appointment - Create appointment
 */
router.post('/Appointment', (req, res) => {
  try {
    const body = req.body;
    
    if (body.resourceType !== "Appointment" || !body.start || !body.participant) {
      const operationOutcome = createOperationOutcome('error', 'invalid', 'Invalid Appointment resource');
      return res.status(400).json(operationOutcome);
    }

    const appointmentData = fromAppointment(body);
    
    if (!appointmentData.patientId || !appointmentData.providerId) {
      const operationOutcome = createOperationOutcome('error', 'invalid', 'Missing patient or practitioner reference');
      return res.status(400).json(operationOutcome);
    }

    // Check if slot is available
    const existingSlot = db.prepare(`
      SELECT * FROM slots 
      WHERE provider_id = ? AND start = ? AND status = 'open'
    `).get(appointmentData.providerId, appointmentData.start);

    if (!existingSlot) {
      const operationOutcome = createOperationOutcome('error', 'conflict', 'Time slot not available');
      return res.status(409).json(operationOutcome);
    }

    const now = new Date().toISOString();
    const id = `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create appointment
    db.prepare(`
      INSERT INTO appointments (id, provider_id, patient_id, start, end, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, 
      appointmentData.providerId, 
      appointmentData.patientId, 
      appointmentData.start, 
      appointmentData.end || appointmentData.start,
      appointmentData.status, 
      now, 
      now
    );

    // Update slot status
    if (existingSlot) {
      db.prepare(`
        UPDATE slots SET status = 'booked' WHERE id = ?
      `).run(existingSlot.id);
    }

    const createdAppointment = db.prepare(`
      SELECT a.*, p.doctor, p.location, u.name as patient_name
      FROM appointments a 
      JOIN providers p ON p.id = a.provider_id
      JOIN users u ON u.id = a.patient_id
      WHERE a.id = ?
    `).get(id);

    const fhirAppointment = toAppointment(createdAppointment);
    const location = `${req.protocol}://${req.get('host')}/fhir/Appointment/${id}`;
    
    res.setHeader('Location', location);
    res.status(201).json(fhirAppointment);
  } catch (error) {
    console.error('FHIR Appointment creation error:', error);
    const operationOutcome = createOperationOutcome('error', 'exception', 'Failed to create appointment');
    res.status(500).json(operationOutcome);
  }
});

export default router;
