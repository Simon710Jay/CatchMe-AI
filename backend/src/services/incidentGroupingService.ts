import { PrismaClient, Log, Incident } from '@prisma/client';
import { LogInput } from '../types';

const prisma = new PrismaClient();

export class IncidentGroupingService {
  static async groupLogIntoIncident(logData: LogInput & { id: string }) {
    // Try to find an existing open incident for this service and message
    const existingIncident = await prisma.incident.findFirst({
      where: {
        service: logData.service,
        title: logData.message,
        status: 'open',
      },
    });

    if (existingIncident) {
      // Update existing incident
      const updatedIncident = await prisma.incident.update({
        where: { id: existingIncident.id },
        data: {
          count: { increment: 1 },
          lastSeen: new Date(),
          // Elevate severity if needed
          severity: this.getHigherSeverity(existingIncident.severity, logData.severity),
        },
      });

      // Link log to incident
      await prisma.log.update({
        where: { id: logData.id },
        data: { incidentId: updatedIncident.id },
      });

      return updatedIncident;
    } else {
      // Create new incident
      const newIncident = await prisma.incident.create({
        data: {
          title: logData.message,
          service: logData.service,
          severity: logData.severity,
          count: 1,
          status: 'open',
        },
      });

      // Link log to incident
      await prisma.log.update({
        where: { id: logData.id },
        data: { incidentId: newIncident.id },
      });

      return newIncident;
    }
  }

  private static getHigherSeverity(current: string, incoming: string): string {
    const priority: Record<string, number> = {
      critical: 3,
      warning: 2,
      info: 1,
      resolved: 0,
    };

    return priority[incoming] > priority[current] ? incoming : current;
  }
}
