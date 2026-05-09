import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/logger.dart';
import '../providers/garage_provider.dart';
import '../widgets/garage_card.dart';
import '../widgets/search_bar.dart' hide FilterChip;
import '../widgets/loading_widget.dart';

class GaragesPage extends ConsumerStatefulWidget {
  const GaragesPage({super.key});

  @override
  ConsumerState<GaragesPage> createState() => _GaragesPageState();
}

class _GaragesPageState extends ConsumerState<GaragesPage> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'الكل';

  final List<String> _categories = [
    'الكل',
    'تغيير زيت',
    'فرامل',
    'إطارات',
    'إصلاح محرك',
    'ناقل الحركة',
    'تكييف',
    'كهرباء',
  ];

  @override
  void initState() {
    super.initState();
    _initializeData();
    _setupScrollListener();
  }

  void _initializeData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(garageProvider.notifier).refresh();
    });
  }

  void _setupScrollListener() {
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 200) {
        _loadMoreGarages();
      }
    });
  }

  void _loadMoreGarages() {
    ref.read(garageProvider.notifier).loadGarages();
  }

  void _onSearchChanged(String query) {
    ref.read(garageProvider.notifier).searchGarages(query);
  }

  void _onCategoryChanged(String category) {
    setState(() {
      _selectedCategory = category;
    });
    // In real app, filter by category
    ref.read(garageProvider.notifier).loadGarages(refresh: true);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final garages = ref.watch(garagesProvider);
    final nearbyGarages = ref.watch(nearbyGaragesProvider);
    final topRatedGarages = ref.watch(topRatedGaragesProvider);
    final isLoading = ref.watch(garageLoadingProvider);
    final error = ref.watch(garageErrorProvider);

    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            snap: true,
            backgroundColor: Theme.of(context).colorScheme.surface,
            elevation: 0,
            title: Text(
              'Garages',
              style: TextStyle(
                fontSize: 24.sp,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            bottom: PreferredSize(
              preferredSize: Size.fromHeight(120.h),
              child: Padding(
                padding: EdgeInsets.all(16.w),
                child: Column(
                  children: [
                    // Search Bar
                    GarageSearchBar(
                      controller: _searchController,
                      onChanged: _onSearchChanged,
                    ),
                    SizedBox(height: 16.h),
                    // Category Filter
                    SizedBox(
                      height: 40.h,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _categories.length,
                        itemBuilder: (context, index) {
                          final category = _categories[index];
                          final isSelected = category == _selectedCategory;
                          
                          return Padding(
                            padding: EdgeInsets.only(right: 8.w),
                            child: FilterChip(
                              label: Text(category),
                              selected: isSelected,
                              onSelected: (selected) {
                                _onCategoryChanged(category);
                              },
                              backgroundColor: Colors.grey[200],
                              selectedColor: AppTheme.primaryColor.withOpacity(0.2),
                              labelStyle: TextStyle(
                                color: isSelected ? AppTheme.primaryColor : Colors.black87,
                                fontSize: 12.sp,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Content
          if (error != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(16.w),
                child: Card(
                  color: AppTheme.errorColor.withOpacity(0.1),
                  child: Padding(
                    padding: EdgeInsets.all(16.w),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, color: AppTheme.errorColor),
                        SizedBox(width: 8.w),
                        Expanded(
                          child: Text(
                            error,
                            style: TextStyle(
                              color: AppTheme.errorColor,
                              fontSize: 14.sp,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.refresh),
                          onPressed: () {
                            ref.read(garageProvider.notifier).refresh();
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          
          // Nearby Garages Section
          if (nearbyGarages.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(16.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.location_on, color: AppTheme.primaryColor, size: 20.sp),
                        SizedBox(width: 8.w),
                        Text(
                          'Nearby Garages',
                          style: TextStyle(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 12.h),
                    SizedBox(
                      height: 180.h,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: nearbyGarages.length,
                        itemBuilder: (context, index) {
                          final garage = nearbyGarages[index];
                          return Container(
                            width: 300.w,
                            margin: EdgeInsets.only(right: 12.w),
                            child: GarageCard(
                              garage: garage,
                              onTap: () {
                                context.navigateToGarageDetails(garage.id);
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          
          // Top Rated Garages Section
          if (topRatedGarages.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(16.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.star, color: AppTheme.secondaryColor, size: 20.sp),
                        SizedBox(width: 8.w),
                        Text(
                          'Top Rated',
                          style: TextStyle(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 12.h),
                    SizedBox(
                      height: 180.h,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: topRatedGarages.length,
                        itemBuilder: (context, index) {
                          final garage = topRatedGarages[index];
                          return Container(
                            width: 300.w,
                            margin: EdgeInsets.only(right: 12.w),
                            child: GarageCard(
                              garage: garage,
                              onTap: () {
                                context.navigateToGarageDetails(garage.id);
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          
          // All Garages Section
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(16.w),
              child: Text(
                'All Garages',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
            ),
          ),
          
          // Garage List
          if (isLoading && garages.isEmpty)
            const SliverFillRemaining(
              child: LoadingWidget(),
            )
          else if (garages.isEmpty && !isLoading)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.garage_outlined,
                      size: 64.sp,
                      color: Theme.of(context).colorScheme.onSurface.withOpacity(0.3),
                    ),
                    SizedBox(height: 16.h),
                    Text(
                      'No garages found',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w600,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      'Try adjusting your search or filters',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  if (index >= garages.length) {
                    return const LoadingWidget();
                  }
                  
                  final garage = garages[index];
                  return GarageListCard(
                    garage: garage,
                    onTap: () {
                      context.navigateToGarageDetails(garage.id);
                    },
                  );
                },
                childCount: garages.length + (isLoading ? 1 : 0),
              ),
            ),
        ],
      ),
    );
  }
}
