import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../widgets/create_booking_form.dart';

class CreateBookingPage extends StatelessWidget {
  final String? garageId;
  final String? serviceId;

  const CreateBookingPage({
    super.key,
    this.garageId,
    this.serviceId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إنشاء حجز'),
      ),
      body: SafeArea(
        child: garageId == null
            ? Center(
                child: Padding(
                  padding: EdgeInsets.all(24.w),
                  child: Text(
                    'يرجى اختيار ورشة من قائمة الورش قبل إنشاء الحجز',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16.sp),
                  ),
                ),
              )
            : SingleChildScrollView(
                padding: EdgeInsets.all(20.w),
                child: CreateBookingForm(
                  garageId: garageId!,
                  serviceId: serviceId,
                ),
              ),
      ),
    );
  }
}
