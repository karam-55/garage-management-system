import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(garageId?: string) {
    const where = garageId ? { id: garageId } : {};

    const garageSettings = await this.prisma.garage.findFirst({
      where,
    });

    const taxRates = await this.prisma.taxRate.findMany({
      where,
    });

    const cancellationPolicies = await this.prisma.cancellationPolicy.findMany({
      where,
    });

    return {
      companyName: garageSettings?.name || 'Garage Management System',
      currency: 'SAR',
      language: 'ar',
      timezone: 'Asia/Riyadh',
      taxRates,
      cancellationPolicies,
      garageSettings,
    };
  }

  async update(updateSettingsDto: any, garageId?: string) {
    const { taxRates, cancellationPolicies, garageSettings, ...systemSettings } = updateSettingsDto;

    // Update garage settings if provided
    if (garageSettings && garageId) {
      await this.prisma.garage.update({
        where: { id: garageId },
        data: garageSettings,
      });
    }

    // Update tax rates if provided
    if (taxRates && garageId) {
      for (const taxRate of taxRates) {
        if (taxRate.id) {
          await this.prisma.taxRate.update({
            where: { id: taxRate.id },
            data: taxRate,
          });
        } else {
          await this.prisma.taxRate.create({
            data: {
              ...taxRate,
              garageId,
            },
          });
        }
      }
    }

    // Update cancellation policies if provided
    if (cancellationPolicies && garageId) {
      for (const policy of cancellationPolicies) {
        if (policy.id) {
          await this.prisma.cancellationPolicy.update({
            where: { id: policy.id },
            data: policy,
          });
        } else {
          await this.prisma.cancellationPolicy.create({
            data: {
              ...policy,
              garageId,
            },
          });
        }
      }
    }

    return this.findAll(garageId);
  }

  async getTaxRates(garageId?: string) {
    const where = garageId ? { garageId } : {};
    return this.prisma.taxRate.findMany({
      where,
      orderBy: { rate: 'asc' },
    });
  }

  async createTaxRate(taxRateDto: any, garageId?: string) {
    return this.prisma.taxRate.create({
      data: {
        ...taxRateDto,
        garageId,
      },
    });
  }

  async updateTaxRate(id: string, taxRateDto: any) {
    const taxRate = await this.prisma.taxRate.findUnique({ where: { id } });
    if (!taxRate) {
      throw new NotFoundException('Tax rate not found');
    }

    return this.prisma.taxRate.update({
      where: { id },
      data: taxRateDto,
    });
  }

  async deleteTaxRate(id: string) {
    return this.prisma.taxRate.delete({
      where: { id },
    });
  }

  async getCancellationPolicies(garageId?: string) {
    const where = garageId ? { garageId } : {};
    return this.prisma.cancellationPolicy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCancellationPolicy(policyDto: any, garageId?: string) {
    return this.prisma.cancellationPolicy.create({
      data: {
        ...policyDto,
        garageId,
      },
    });
  }

  async updateCancellationPolicy(id: string, policyDto: any) {
    const policy = await this.prisma.cancellationPolicy.findUnique({ where: { id } });
    if (!policy) {
      throw new NotFoundException('Cancellation policy not found');
    }

    return this.prisma.cancellationPolicy.update({
      where: { id },
      data: policyDto,
    });
  }

  async deleteCancellationPolicy(id: string) {
    return this.prisma.cancellationPolicy.delete({
      where: { id },
    });
  }

  async getDiscounts(garageId?: string) {
    const where = garageId ? { garageId } : {};
    return this.prisma.discount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDiscount(discountDto: any, garageId?: string) {
    const { code, type, value, startDate, endDate, maxUses, ...rest } = discountDto;

    // Check if code already exists
    const existing = await this.prisma.discount.findFirst({
      where: { code },
    });

    if (existing) {
      throw new BadRequestException('Discount code already exists');
    }

    return this.prisma.discount.create({
      data: {
        code,
        type: type || 'PERCENTAGE' as any,
        value,
        startDate: startDate || new Date(),
        endDate,
        maxUses,
        usedCount: 0,
        isActive: true,
        garageId,
        ...rest,
      },
    });
  }

  async updateDiscount(id: string, discountDto: any) {
    const discount = await this.prisma.discount.findUnique({ where: { id } });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return this.prisma.discount.update({
      where: { id },
      data: discountDto,
    });
  }

  async deleteDiscount(id: string) {
    return this.prisma.discount.delete({
      where: { id },
    });
  }

  async validateDiscount(code: string, garageId?: string) {
    const where: any = { code, isActive: true };
    if (garageId) where.garageId = garageId;

    const discount = await this.prisma.discount.findFirst({
      where,
    });

    if (!discount) {
      throw new NotFoundException('Invalid discount code');
    }

    const now = new Date();

    // Check if discount is expired
    if (discount.endDate && new Date(discount.endDate) < now) {
      throw new BadRequestException('Discount code has expired');
    }

    // Check if discount hasn't started yet
    if (discount.startDate && new Date(discount.startDate) > now) {
      throw new BadRequestException('Discount code is not yet valid');
    }

    // Check if max uses reached
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new BadRequestException('Discount code has reached maximum uses');
    }

    return discount;
  }

  async getGarageSettings(garageId: string) {
    const garage = await this.prisma.garage.findUnique({
      where: { id: garageId },
      include: {
        owner: true,
      },
    });

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    return garage;
  }

  async updateGarageSettings(garageId: string, settingsDto: any) {
    const garage = await this.prisma.garage.findUnique({
      where: { id: garageId },
    });

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    return this.prisma.garage.update({
      where: { id: garageId },
      data: settingsDto,
    });
  }
}
