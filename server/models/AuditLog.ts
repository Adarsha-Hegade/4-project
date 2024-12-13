import mongoose from 'mongoose';

export interface IAuditLog {
  userId: mongoose.Types.ObjectId;
  action: string;
  details: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);