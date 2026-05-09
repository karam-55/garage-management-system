import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsIn, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  garageId?: string;

  @IsIn(['BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_IN_PROGRESS', 'BOOKING_COMPLETED', 'BOOKING_CANCELLED', 'PAYMENT_RECEIVED', 'INVOICE_SENT', 'LOW_STOCK', 'APPROVAL_REQUESTED', 'APPROVAL_APPROVED', 'APPROVAL_REJECTED'])
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_IN_PROGRESS' | 'BOOKING_COMPLETED' | 'BOOKING_CANCELLED' | 'PAYMENT_RECEIVED' | 'INVOICE_SENT' | 'LOW_STOCK' | 'APPROVAL_REQUESTED' | 'APPROVAL_APPROVED' | 'APPROVAL_REJECTED';

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  titleAr: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  messageAr: string;

  @IsUUID()
  @IsOptional()
  relatedBookingId?: string;

  @IsUUID()
  @IsOptional()
  relatedInvoiceId?: string;

  @IsUUID()
  @IsOptional()
  relatedVehicleId?: string;

  @IsIn(['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP', 'PUSH'])
  @IsOptional()
  channels?: ('EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP' | 'PUSH')[];
}

export class UpdateNotificationDto {
  @IsIn(['PENDING', 'SENT', 'FAILED', 'READ'])
  @IsOptional()
  status?: 'PENDING' | 'SENT' | 'FAILED' | 'READ';

  @IsDateString()
  @IsOptional()
  sentAt?: string;

  @IsDateString()
  @IsOptional()
  readAt?: string;
}

export class CreateNotificationTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  subjectAr: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  bodyAr: string;

  @IsIn(['EMAIL', 'SMS', 'WHATSAPP'])
  channel: 'EMAIL' | 'SMS' | 'WHATSAPP';

  @IsString()
  @IsOptional()
  variables?: string;
}

export class UpdateNotificationPreferencesDto {
  @IsIn(['EMAIL', 'SMS', 'WHATSAPP', 'IN_APP', 'PUSH'])
  @IsOptional()
  preferredChannels?: ('EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP' | 'PUSH')[];

  @IsString()
  @IsOptional()
  language?: string;

  @IsDateString()
  @IsOptional()
  quietHoursStart?: string;

  @IsDateString()
  @IsOptional()
  quietHoursEnd?: string;

  @IsIn(['ALL', 'IMPORTANT', 'NONE'])
  @IsOptional()
  bookingUpdates?: 'ALL' | 'IMPORTANT' | 'NONE';

  @IsIn(['ALL', 'IMPORTANT', 'NONE'])
  @IsOptional()
  paymentUpdates?: 'ALL' | 'IMPORTANT' | 'NONE';

  @IsIn(['ALL', 'IMPORTANT', 'NONE'])
  @IsOptional()
  promotional?: 'ALL' | 'IMPORTANT' | 'NONE';
}
