const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCapAlert } = require('../services/capAlertService');

const cap = (status = 'Actual') => `<?xml version="1.0"?><cap:alert xmlns:cap="urn:oasis:names:tc:emergency:cap:1.2"><cap:identifier>urn:test:alert-1</cap:identifier><cap:sender>imd@example.gov.in</cap:sender><cap:sent>2026-09-21T10:00:00Z</cap:sent><cap:status>${status}</cap:status><cap:msgType>Alert</cap:msgType><cap:info><cap:event>Thunderstorm with Lightning</cap:event><cap:urgency>Immediate</cap:urgency><cap:severity>Severe</cap:severity><cap:certainty>Likely</cap:certainty><cap:headline>Thunderstorm warning</cap:headline><cap:description>Stay indoors.</cap:description><cap:instruction>Follow official instructions.</cap:instruction><cap:expires>2099-09-21T12:00:00Z</cap:expires><cap:area><cap:areaDesc>Test district</cap:areaDesc><cap:polygon>20,70 21,70 21,71 20,70</cap:polygon></cap:area></cap:info></cap:alert>`;

test('parses CAP metadata and polygon', () => {
  const alert = parseCapAlert(cap());
  assert.equal(alert.externalAlertId, 'urn:test:alert-1');
  assert.equal(alert.sender, 'imd@example.gov.in');
  assert.equal(alert.event, 'Thunderstorm with Lightning');
  assert.equal(alert.areaDescription, 'Test district');
  assert.deepEqual(alert.polygon[0], [70, 20]);
  assert.equal(alert.status, 'Active');
});

test('marks cancelled CAP messages as cancelled', () => {
  const alert = parseCapAlert(cap('Cancelled'));
  assert.equal(alert.status, 'Cancelled');
});

test('rejects malformed CAP documents', () => {
  assert.throws(() => parseCapAlert('<not-cap/>'), /CAP alert element not found/);
});