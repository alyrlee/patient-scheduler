// src/fhir/mappers.js - Data model mapping between DB and FHIR R4
// Note: Using .js instead of .ts for compatibility with current setup

/**
 * Convert database provider to FHIR Practitioner
 */
export function toPractitioner(p) {
  const [family, given] = p.doctor.includes(",")
    ? p.doctor.split(",").map(s => s.trim())
    : [p.doctor.split(" ").slice(-1)[0], p.doctor.split(" ").slice(0, -1).join(" ")];

  return {
    resourceType: "Practitioner",
    id: p.id,
    name: [{ 
      family, 
      given: given ? [given] : undefined 
    }],
    qualification: p.specialty
      ? [{ 
          code: { 
            coding: [{ 
              system: "http://nucc.org/provider-taxonomy", 
              code: getSpecialtyCode(p.specialty),
              display: p.specialty 
            }] 
          } 
        }]
      : undefined,
    address: p.location ? [{
      text: p.location,
      city: p.location
    }] : undefined
  };
}

/**
 * Convert database user to FHIR Patient
 */
export function toPatient(u) {
  const parts = u.name ? u.name.split(" ") : ["Unknown"];
  return {
    resourceType: "Patient",
    id: u.id,
    name: [{ 
      family: parts.slice(-1)[0], 
      given: parts.slice(0, -1) 
    }],
    birthDate: u.birthDate,
    telecom: u.email ? [{
      system: "email",
      value: u.email,
      use: "home"
    }] : undefined
  };
}

/**
 * Convert database appointment to FHIR Appointment
 */
export function toAppointment(a) {
  return {
    resourceType: "Appointment",
    id: a.id,
    status: mapAppointmentStatus(a.status),
    start: a.start,
    end: a.end || a.start, // Use start as end if no end time
    participant: [
      { 
        actor: { reference: `Patient/${a.patient_id || a.patientId}` }, 
        status: "accepted" 
      },
      { 
        actor: { reference: `Practitioner/${a.provider_id || a.providerId}` }, 
        status: "accepted" 
      }
    ],
    created: a.created_at,
    meta: {
      lastUpdated: a.updated_at
    }
  };
}

/**
 * Convert FHIR Appointment to database format
 */
export function fromAppointment(resource) {
  const start = resource.start;
  const end = resource.end;
  
  const patientRef = resource.participant?.find(p => 
    p.actor?.reference?.startsWith("Patient/")
  )?.actor?.reference;
  
  const providerRef = resource.participant?.find(p => 
    p.actor?.reference?.startsWith("Practitioner/")
  )?.actor?.reference;
  
  return {
    start,
    end,
    patientId: patientRef ? patientRef.split("/")[1] : null,
    providerId: providerRef ? providerRef.split("/")[1] : null,
    status: mapFromAppointmentStatus(resource.status)
  };
}

/**
 * Map appointment status from DB to FHIR
 */
function mapAppointmentStatus(status) {
  const statusMap = {
    'confirmed': 'booked',
    'cancelled': 'cancelled',
    'pending': 'proposed',
    'booked': 'booked'
  };
  return statusMap[status] || 'booked';
}

/**
 * Map appointment status from FHIR to DB
 */
function mapFromAppointmentStatus(status) {
  const statusMap = {
    'booked': 'confirmed',
    'cancelled': 'cancelled',
    'proposed': 'pending',
    'confirmed': 'confirmed'
  };
  return statusMap[status] || 'confirmed';
}

/**
 * Get specialty taxonomy code for common specialties
 */
function getSpecialtyCode(specialty) {
  const specialtyCodes = {
    'Cardiology': '207RC0000X',
    'Oncology': '207RX0202X',
    'Pediatrics': '208000000X',
    'Orthopedics': '207X00000X',
    'Dermatology': '207N00000X',
    'Neurology': '2084N0400X'
  };
  return specialtyCodes[specialty] || '207Q00000X'; // General practice fallback
}

/**
 * Create FHIR Bundle for search results
 */
export function createBundle(entries, total, baseUrl) {
  return {
    resourceType: "Bundle",
    type: "searchset",
    total: total,
    entry: entries.map(entry => ({
      resource: entry.resource,
      fullUrl: `${baseUrl}/fhir/${entry.resource.resourceType}/${entry.resource.id}`
    }))
  };
}

/**
 * Create OperationOutcome for errors
 */
export function createOperationOutcome(severity, code, details) {
  return {
    resourceType: "OperationOutcome",
    issue: [{
      severity,
      code,
      details: { text: details }
    }]
  };
}
