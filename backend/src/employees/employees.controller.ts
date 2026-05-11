import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employees.dto';
import { Roles } from '../auth/roles.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles('OWNER', 'MANAGER')
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles('OWNER', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  @Roles('OWNER')
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Put(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('OWNER')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
