import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        customer: true,
        vehicle: true,
        booking: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        booking: true,
      },
    });
  }

  async create(createInvoiceDto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: createInvoiceDto,
    });
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    return this.prisma.invoice.update({
      where: { id },
      data: updateInvoiceDto,
    });
  }

  async delete(id: string) {
    return this.prisma.invoice.delete({
      where: { id },
    });
  }
}
