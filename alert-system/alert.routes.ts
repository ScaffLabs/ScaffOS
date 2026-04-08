import { logAudit } from './audit.logger';
// Inside the create alert route
const createdAlert = await alertStore.create(alert);
logAudit('CREATE_ALERT', createdAlert);  // Audit logging

// Inside the update alert route
const updatedAlert = await alertStore.update(req.params.id, req.body);
logAudit('UPDATE_ALERT', { id: req.params.id, updatedAlert });  // Audit logging

// Inside the delete alert route
const deleted = await alertStore.delete(req.params.id);
logAudit('DELETE_ALERT', { id: req.params.id, deleted });  // Audit logging
