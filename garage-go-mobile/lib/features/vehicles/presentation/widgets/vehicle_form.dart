import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:form_builder_validators/form_builder_validators.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/logger.dart';
import '../../data/models/vehicle_model.dart';
import '../providers/vehicle_provider.dart';

class VehicleForm extends ConsumerStatefulWidget {
  final Vehicle? vehicle;

  const VehicleForm({
    super.key,
    this.vehicle,
  });

  @override
  ConsumerState<VehicleForm> createState() => _VehicleFormState();
}

class _VehicleFormState extends ConsumerState<VehicleForm> {
  final _formKey = GlobalKey<FormState>();
  final _makeController = TextEditingController();
  final _modelController = TextEditingController();
  final _yearController = TextEditingController();
  final _plateNumberController = TextEditingController();
  final _colorController = TextEditingController();
  final _vinController = TextEditingController();
  final _mileageController = TextEditingController();
  
  String? _selectedFuelType;
  String? _selectedTransmission;
  String? _selectedEngineType;
  bool _isActive = true;

  final List<String> _fuelTypes = [
    'Petrol',
    'Diesel',
    'Electric',
    'Hybrid',
    'LPG',
    'CNG',
  ];

  final List<String> _transmissions = [
    'Manual',
    'Automatic',
    'CVT',
    'Semi-Automatic',
  ];

  final List<String> _engineTypes = [
    '4 Cylinder',
    '6 Cylinder',
    '8 Cylinder',
    'Electric Motor',
    'Hybrid',
  ];

  @override
  void initState() {
    super.initState();
    _initializeForm();
  }

  void _initializeForm() {
    if (widget.vehicle != null) {
      final vehicle = widget.vehicle!;
      _makeController.text = vehicle.make;
      _modelController.text = vehicle.model;
      _yearController.text = vehicle.year.toString();
      _plateNumberController.text = vehicle.plateNumber;
      _colorController.text = vehicle.color ?? '';
      _vinController.text = vehicle.vin ?? '';
      _mileageController.text = vehicle.mileage?.toString() ?? '';
      _selectedFuelType = vehicle.fuelType;
      _selectedTransmission = vehicle.transmission;
      _selectedEngineType = vehicle.engineType;
      _isActive = vehicle.isActive;
    }
  }

  @override
  void dispose() {
    _makeController.dispose();
    _modelController.dispose();
    _yearController.dispose();
    _plateNumberController.dispose();
    _colorController.dispose();
    _vinController.dispose();
    _mileageController.dispose();
    super.dispose();
  }

  Future<void> _saveVehicle() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final isEditing = widget.vehicle != null;

    try {
      if (isEditing) {
        final request = UpdateVehicleRequest(
          make: _makeController.text.trim(),
          model: _modelController.text.trim(),
          year: int.parse(_yearController.text),
          plateNumber: _plateNumberController.text.trim(),
          color: _colorController.text.trim().isEmpty ? null : _colorController.text.trim(),
          vin: _vinController.text.trim().isEmpty ? null : _vinController.text.trim(),
          mileage: _mileageController.text.trim().isEmpty ? null : int.parse(_mileageController.text),
          fuelType: _selectedFuelType,
          transmission: _selectedTransmission,
          engineType: _selectedEngineType,
          isActive: _isActive,
        );

        await ref.read(vehicleProvider.notifier).updateVehicle(
          widget.vehicle!.id,
          request,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Vehicle updated successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
          Navigator.of(context).pop();
        }
      } else {
        final request = CreateVehicleRequest(
          make: _makeController.text.trim(),
          model: _modelController.text.trim(),
          year: int.parse(_yearController.text),
          plateNumber: _plateNumberController.text.trim(),
          color: _colorController.text.trim().isEmpty ? null : _colorController.text.trim(),
          vin: _vinController.text.trim().isEmpty ? null : _vinController.text.trim(),
          mileage: _mileageController.text.trim().isEmpty ? null : int.parse(_mileageController.text),
          fuelType: _selectedFuelType,
          transmission: _selectedTransmission,
          engineType: _selectedEngineType,
        );

        await ref.read(vehicleProvider.notifier).createVehicle(request);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Vehicle added successfully!'),
              backgroundColor: AppTheme.successColor,
            ),
          );
          Navigator.of(context).pop();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save vehicle: ${e.toString()}'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isCreating = ref.watch(vehicleCreatingProvider);
    final isUpdating = ref.watch(vehicleUpdatingProvider);
    final isLoading = isCreating || isUpdating;

    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Basic Information
          _buildSectionHeader('Basic Information'),
          
          Row(
            children: [
              Expanded(child: _buildMakeField()),
              SizedBox(width: 16.w),
              Expanded(child: _buildModelField()),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          Row(
            children: [
              Expanded(child: _buildYearField()),
              SizedBox(width: 16.w),
              Expanded(child: _buildPlateNumberField()),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          _buildColorField(),
          
          SizedBox(height: 16.h),
          
          // Vehicle Details
          _buildSectionHeader('Vehicle Details'),
          
          Row(
            children: [
              Expanded(child: _buildFuelTypeField()),
              SizedBox(width: 16.w),
              Expanded(child: _buildTransmissionField()),
            ],
          ),
          
          SizedBox(height: 16.h),
          
          _buildEngineTypeField(),
          
          SizedBox(height: 16.h),
          
          _buildVinField(),
          
          SizedBox(height: 16.h),
          
          _buildMileageField(),
          
          SizedBox(height: 16.h),
          
          // Status
          if (widget.vehicle != null) ...[
            _buildSectionHeader('Status'),
            SwitchListTile(
              title: const Text('Active'),
              subtitle: const Text('Enable or disable this vehicle'),
              value: _isActive,
              onChanged: (value) {
                setState(() {
                  _isActive = value;
                });
              },
              activeColor: AppTheme.primaryColor,
            ),
            SizedBox(height: 16.h),
          ],
          
          // Save Button
          SizedBox(
            width: double.infinity,
            height: 56.h,
            child: ElevatedButton(
              onPressed: isLoading ? null : _saveVehicle,
              child: isLoading
                  ? SizedBox(
                      width: 20.w,
                      height: 20.h,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          Theme.of(context).colorScheme.onPrimary,
                        ),
                      ),
                    )
                  : Text(widget.vehicle != null ? 'Update Vehicle' : 'Add Vehicle'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 16.sp,
          fontWeight: FontWeight.bold,
          color: Theme.of(context).colorScheme.onBackground,
        ),
      ),
    );
  }

  Widget _buildMakeField() {
    return TextFormField(
      controller: _makeController,
      decoration: InputDecoration(
        labelText: 'Make *',
        hintText: 'e.g., Toyota',
        prefixIcon: const Icon(Icons.directions_car),
      ),
      validator: FormBuilderValidators.required(
        errorText: 'Please enter vehicle make',
      ),
      textInputAction: TextInputAction.next,
    );
  }

  Widget _buildModelField() {
    return TextFormField(
      controller: _modelController,
      decoration: InputDecoration(
        labelText: 'Model *',
        hintText: 'e.g., Camry',
        prefixIcon: const Icon(Icons.directions_car),
      ),
      validator: FormBuilderValidators.required(
        errorText: 'Please enter vehicle model',
      ),
      textInputAction: TextInputAction.next,
    );
  }

  Widget _buildYearField() {
    return TextFormField(
      controller: _yearController,
      decoration: InputDecoration(
        labelText: 'Year *',
        hintText: 'e.g., 2020',
        prefixIcon: const Icon(Icons.calendar_today),
      ),
      keyboardType: TextInputType.number,
      validator: FormBuilderValidators.compose([
        FormBuilderValidators.required(errorText: 'Please enter year'),
        FormBuilderValidators.min(1900, errorText: 'Year must be 1900 or later'),
        FormBuilderValidators.max(DateTime.now().year + 1, errorText: 'Year cannot be in the future'),
      ]),
      textInputAction: TextInputAction.next,
    );
  }

  Widget _buildPlateNumberField() {
    return TextFormField(
      controller: _plateNumberController,
      decoration: InputDecoration(
        labelText: 'Plate Number *',
        hintText: 'e.g., ABC-1234',
        prefixIcon: const Icon(Icons.credit_card),
      ),
      validator: FormBuilderValidators.required(
        errorText: 'Please enter plate number',
      ),
      textInputAction: TextInputAction.next,
    );
  }

  Widget _buildColorField() {
    return TextFormField(
      controller: _colorController,
      decoration: InputDecoration(
        labelText: 'Color',
        hintText: 'e.g., Red',
        prefixIcon: const Icon(Icons.palette),
      ),
      textInputAction: TextInputAction.next,
    );
  }

  Widget _buildFuelTypeField() {
    return DropdownButtonFormField<String>(
      value: _selectedFuelType,
      decoration: InputDecoration(
        labelText: 'Fuel Type',
        hintText: 'Select fuel type',
        prefixIcon: const Icon(Icons.local_gas_station),
      ),
      items: _fuelTypes.map((fuelType) {
        return DropdownMenuItem(
          value: fuelType,
          child: Text(fuelType),
        );
      }).toList(),
      onChanged: (value) {
        setState(() {
          _selectedFuelType = value;
        });
      },
    );
  }

  Widget _buildTransmissionField() {
    return DropdownButtonFormField<String>(
      value: _selectedTransmission,
      decoration: InputDecoration(
        labelText: 'Transmission',
        hintText: 'Select transmission',
        prefixIcon: const Icon(Icons.settings),
      ),
      items: _transmissions.map((transmission) {
        return DropdownMenuItem(
          value: transmission,
          child: Text(transmission),
        );
      }).toList(),
      onChanged: (value) {
        setState(() {
          _selectedTransmission = value;
        });
      },
    );
  }

  Widget _buildEngineTypeField() {
    return DropdownButtonFormField<String>(
      value: _selectedEngineType,
      decoration: InputDecoration(
        labelText: 'Engine Type',
        hintText: 'Select engine type',
        prefixIcon: const Icon(Icons.engineering),
      ),
      items: _engineTypes.map((engineType) {
        return DropdownMenuItem(
          value: engineType,
          child: Text(engineType),
        );
      }).toList(),
      onChanged: (value) {
        setState(() {
          _selectedEngineType = value;
        });
      },
    );
  }

  Widget _buildVinField() {
    return TextFormField(
      controller: _vinController,
      decoration: InputDecoration(
        labelText: 'VIN Number',
        hintText: 'Vehicle Identification Number',
        prefixIcon: const Icon(Icons.confirmation_number),
      ),
      textInputAction: TextInputAction.next,
    );
  }

  Widget _buildMileageField() {
    return TextFormField(
      controller: _mileageController,
      decoration: InputDecoration(
        labelText: 'Mileage (km)',
        hintText: 'e.g., 50000',
        prefixIcon: const Icon(Icons.speed),
      ),
      keyboardType: TextInputType.number,
      validator: FormBuilderValidators.min(0, errorText: 'Mileage cannot be negative'),
      textInputAction: TextInputAction.done,
    );
  }
}
