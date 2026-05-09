import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/logger.dart';
import '../../data/models/garage_model.dart';
import '../../data/repositories/garage_repository.dart';

// Garage State
class GarageState {
  final List<Garage> garages;
  final List<Garage> nearbyGarages;
  final List<Garage> topRatedGarages;
  final GarageWithServices? selectedGarage;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final int currentPage;
  final bool hasMore;

  const GarageState({
    this.garages = const [],
    this.nearbyGarages = const [],
    this.topRatedGarages = const [],
    this.selectedGarage,
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
  });

  GarageState copyWith({
    List<Garage>? garages,
    List<Garage>? nearbyGarages,
    List<Garage>? topRatedGarages,
    GarageWithServices? selectedGarage,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    int? currentPage,
    bool? hasMore,
  }) {
    return GarageState(
      garages: garages ?? this.garages,
      nearbyGarages: nearbyGarages ?? this.nearbyGarages,
      topRatedGarages: topRatedGarages ?? this.topRatedGarages,
      selectedGarage: selectedGarage ?? this.selectedGarage,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: error ?? this.error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GarageState &&
        other.garages == garages &&
        other.nearbyGarages == nearbyGarages &&
        other.topRatedGarages == topRatedGarages &&
        other.selectedGarage == selectedGarage &&
        other.isLoading == isLoading &&
        other.isLoadingMore == isLoadingMore &&
        other.error == error &&
        other.currentPage == currentPage &&
        other.hasMore == hasMore;
  }

  @override
  int get hashCode {
    return garages.hashCode ^
        nearbyGarages.hashCode ^
        topRatedGarages.hashCode ^
        selectedGarage.hashCode ^
        isLoading.hashCode ^
        isLoadingMore.hashCode ^
        error.hashCode ^
        currentPage.hashCode ^
        hasMore.hashCode;
  }
}

// Garage Provider
final garageProvider = StateNotifierProvider<GarageNotifier, GarageState>((ref) {
  return GarageNotifier(ref.read(garageRepositoryProvider));
});

class GarageNotifier extends StateNotifier<GarageState> {
  final GarageRepository _garageRepository;

  GarageNotifier(this._garageRepository) : super(const GarageState());

  Future<void> loadGarages({
    String? search,
    bool refresh = false,
  }) async {
    if (refresh) {
      state = state.copyWith(
        garages: [],
        currentPage: 1,
        hasMore: true,
        error: null,
      );
    }

    if (state.isLoading || (!state.hasMore && !refresh)) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final garages = await _garageRepository.getGarages(
        search: search,
        page: state.currentPage,
        limit: 10,
      );

      final updatedGarages = refresh
          ? garages
          : [...state.garages, ...garages];

      state = state.copyWith(
        garages: updatedGarages,
        isLoading: false,
        currentPage: state.currentPage + 1,
        hasMore: garages.length == 10,
      );

      Logger.info('Loaded ${garages.length} garages');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Failed to load garages', e);
    }
  }

  Future<void> loadNearbyGarages({
    double? latitude,
    double? longitude,
  }) async {
    try {
      final nearbyGarages = await _garageRepository.getNearbyGarages(
        latitude: latitude,
        longitude: longitude,
        limit: 10,
      );

      state = state.copyWith(nearbyGarages: nearbyGarages);

      Logger.info('Loaded ${nearbyGarages.length} nearby garages');
    } catch (e) {
      Logger.error('Failed to load nearby garages', e);
    }
  }

  Future<void> loadTopRatedGarages() async {
    try {
      final topRatedGarages = await _garageRepository.getTopRatedGarages(limit: 10);

      state = state.copyWith(topRatedGarages: topRatedGarages);

      Logger.info('Loaded ${topRatedGarages.length} top rated garages');
    } catch (e) {
      Logger.error('Failed to load top rated garages', e);
    }
  }

  Future<void> loadGarageById(String garageId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final garageWithServices = await _garageRepository.getGarageById(garageId);

      state = state.copyWith(
        selectedGarage: garageWithServices,
        isLoading: false,
      );

      Logger.info('Loaded garage details: ${garageWithServices.garage.name}');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Failed to load garage details', e);
    }
  }

  Future<void> searchGarages(String query) async {
    if (query.trim().isEmpty) {
      await loadGarages(refresh: true);
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      final garages = await _garageRepository.getGarages(
        search: query,
        page: 1,
        limit: 10,
      );

      state = state.copyWith(
        garages: garages,
        isLoading: false,
        currentPage: 2,
        hasMore: garages.length == 10,
      );

      Logger.info('Searched garages: ${garages.length} results');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Failed to search garages', e);
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void clearSelectedGarage() {
    state = state.copyWith(selectedGarage: null);
  }

  Future<void> refresh() async {
    await loadGarages(refresh: true);
    await loadNearbyGarages();
    await loadTopRatedGarages();
  }
}

// Specific providers for easier access
final garagesProvider = Provider<List<Garage>>((ref) {
  return ref.watch(garageProvider).garages;
});

final nearbyGaragesProvider = Provider<List<Garage>>((ref) {
  return ref.watch(garageProvider).nearbyGarages;
});

final topRatedGaragesProvider = Provider<List<Garage>>((ref) {
  return ref.watch(garageProvider).topRatedGarages;
});

final selectedGarageProvider = Provider<GarageWithServices?>((ref) {
  return ref.watch(garageProvider).selectedGarage;
});

final garageLoadingProvider = Provider<bool>((ref) {
  return ref.watch(garageProvider).isLoading;
});

final garageErrorProvider = Provider<String?>((ref) {
  return ref.watch(garageProvider).error;
});
