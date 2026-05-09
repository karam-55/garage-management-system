import apiClient from './api-client';

export interface QRSessionData {
  id: string;
  customerId: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  garageId: string;
  garage: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  vehicleId: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    plate: string;
    vin?: string;
  };
  serviceId?: string;
  service?: {
    id: string;
    name: string;
    description?: string;
    price: number;
  };
  assignedMechanicId?: string;
  assignedMechanic?: {
    id: string;
    fullName: string;
    phone?: string;
  };
  scheduledAt: Date;
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
  status: string;
  qrToken: string;
  qrExpiresAt: Date;
  estimatedCompletionAt?: Date;
  actualCompletionAt?: Date;
  notes?: string;
  additionalServices: Array<{
    id: string;
    serviceName: string;
    price: number;
    approved: boolean;
    notes?: string;
  }>;
  customerApprovals: Array<{
    id: string;
    approvalType: string;
    status: string;
    details: any;
    createdAt: Date;
    respondedAt?: Date;
  }>;
  mechanicHandovers: Array<{
    id: string;
    fromMechanic?: {
      id: string;
      fullName: string;
    };
    toMechanic?: {
      id: string;
      fullName: string;
    };
    handoverTime: Date;
    status: string;
    notes?: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    issuedDate?: Date;
    dueDate?: Date;
    paidDate?: Date;
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      taxAmount: number;
      total: number;
    }>;
    discount?: {
      id: string;
      name: string;
      type: string;
      value: number;
    };
    payments: Array<{
      id: string;
      amount: number;
      method: string;
      status: string;
      paidAt?: Date;
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export const qrSessionService = {
  async getQRSession(qrToken: string): Promise<QRSessionData> {
    const response = await apiClient.get(`/bookings/qr/${qrToken}`);
    return response.data;
  },

  async approveAdditionalService(qrToken: string, serviceId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/bookings/qr/${qrToken}/approve`, { serviceId });
    return response.data;
  },

  async rejectAdditionalService(qrToken: string, serviceId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/bookings/qr/${qrToken}/reject`, { serviceId });
    return response.data;
  },
};
