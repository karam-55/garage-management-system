import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/logger.dart';
import '../../data/models/vehicle_model.dart';
import '../../data/repositories/vehicle_repository.dart';

// Vehicle State
class VehicleState {
  final List<Vehicle> vehicles;
  final Vehicle? selectedVehicle;
  final VehicleStats? stats;
  final List<VehicleServiceHistory> serviceHistory;
  final bool isLoading;
  final bool isLoadingMore;
  final bool isCreating;
  final bool isUpdating;
  final bool isDeleting;
  final String? error;
  final int currentPage;
  final bool hasMore;
  final bool? activeFilter;

  const VehicleState({
    this.vehicles = const [],
    this.selectedVehicle,
    this.stats,
    this.serviceHistory = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.isCreating = false,
    this.isUpdating = false,
    this.isDeleting = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
    this.activeFilter,
  });

  VehicleState copyWith({
    List<Vehicle>? vehicles,
    Vehicle? selectedVehicle,
    VehicleStats? stats,
    List<VehicleServiceHistory>? serviceHistory,
    bool? isLoading,
    bool? isLoadingMore,
    bool? isCreating,
    bool? isUpdating,
    bool? isDeleting,
    String? error,
    int? currentPage,
    bool? hasMore,
    bool? activeFilter,
  }) {
    return VehicleState(
      vehicles: vehicles ?? this.vehicles,
      selectedVehicle: selectedVehicle ?? this.selectedVehicle,
      stats: stats ?? this.stats,
      serviceHistory: serviceHistory ?? this.serviceHistory,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isCreating: isCreating ?? this.isCreating,
      isUpdating: isUpdating ?? this.isUpdating,
      isDeleting: isDeleting ?? this.isDeleting,
      error: error ?? this.error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      activeFilter: activeFilter ?? this.activeFilter,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is VehicleState &&
        other.vehicles == vehicles &&
        other.selectedVehicle == selectedVehicle &&
        other.stats == stats &&
        other.serviceHistory == serviceHistory &&
        other.isLoading == isLoading &&
        other.isLoadingMore == isLoadingMore &&
        other.isCreating == isCreating &&
        other.isUpdating == isUpdating &&
        other.isDeleting == isDeleting &&
        other.error == error &&
        other.currentPage == currentPage &&
        other.hasMore == hasMore &&
        other.activeFilter == activeFilter;
  }

  @override
  int get hashCode {
    return vehicles.hashCode ^
        selectedVehicle.hashCode ^
        stats.hashCode ^
        serviceHistory.hashCode ^
        isLoading.hashCode ^
        isLoadingMore.hashCode ^
        isCreating.hashCode ^
        isUpdating.hashCode ^
        isDeleting.hashCode ^
        error.hashCode ^
        currentPage.hashCode ^
        hasMore.hashCode ^
        activeFilter.hashCode;
  }
}

// Vehicle Provider
final vehicleProvider = StateNotifierProvider<VehicleNotifier, VehicleState>((ref) {
  return VehicleNotifier(ref.read(vehicleRepositoryProvider));
});

class VehicleNotifier extends StateNotifier<VehicleState> {
  final VehicleRepository _vehicleRepository;

  VehicleNotifier(this._vehicleRepository) : super(const VehicleState());

  Future<void> loadVehicles({
    bool? isActive,
    bool refresh = false,
  }) async {
    if (refresh) {
      state = state.copyWith(
        vehicles: [],
        currentPage: 1,
        hasMore: true,
        error: null,
        activeFilter: isActive,
      );
    }

    if (state.isLoading || (!state.hasMore && !refresh)) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final vehicles = await _vehicleRepository.getUserVehicles(
        isActive: isActive ?? state.activeFilter,
        page: state.currentPage,
        limit: 10,
      );

      final updatedVehicles = refresh
          ? vehicles
          : [...state.vehicles, ...vehicles];

      state = state.copyWith(
        vehicles: updatedVehicles,
        isLoading: false,
        currentPage: state.currentPage + 1,
        hasMore: vehicles.length == 10,
      );

      Logger.info('Loaded ${vehicles.length} vehicles');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Failed to load vehicles', e);
    }
  }

  Future<void> loadVehicleById(String vehicleId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final vehicle = await _vehicleRepository.getVehicleById(vehicleId);

      state = state.copyWith(
        selectedVehicle: vehicle,
        isLoading: false,
      );

      Logger.info('Loaded vehicle details: ${vehicle.id}');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Failed to load vehicle details', e);
    }
  }

  Future<Vehicle> createVehicle(CreateVehicleRequest request) async {
    state = state.copyWith(isCreating: true, error: null);

    try {
      final vehicle = await _vehicleRepository.createVehicle(request);

      // Add to the beginning of the list
      final updatedVehicles = [vehicle, ...state.vehicles];

      state = state.copyWith(
        vehicles: updatedVehicles,
        isCreating: false,
      );

      Logger.info('Created vehicle: ${vehicle.id}');
      return vehicle;
    } catch (e) {
      state = state.copyWith(
        isCreating: false,
        error: e.toString(),
      );
      Logger.error('Failed to create vehicle', e);
      rethrow;
    }
  }

  Future<Vehicle> updateVehicle(
    String vehicleId,
    UpdateVehicleRequest request,
  ) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      final updatedVehicle = await _vehicleRepository.updateVehicle(
        vehicleId,
        request,
      );

      // Update the vehicle in the list
      final updatedVehicles = state.vehicles.map((vehicle) {
        return vehicle.id == vehicleId ? updatedVehicle : vehicle;
      }).toList();

      // Update selected vehicle if it's the same
      final selectedVehicle = state.selectedVehicle?.id == vehicleId
          ? updatedVehicle
          : state.selectedVehicle;

      state = state.copyWith(
        vehicles: updatedVehicles,
        selectedVehicle: selectedVehicle,
        isUpdating: false,
      );

      Logger.info('Updated vehicle: $vehicleId');
      return updatedVehicle;
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      Logger.error('Failed to update vehicle', e);
      rethrow;
    }
  }

  Future<void> deleteVehicle(String vehicleId) async {
    state = state.copyWith(isDeleting: true, error: null);

    try {
      await _vehicleRepository.deleteVehicle(vehicleId);

      // Remove from the list
      final updatedVehicles = state.vehicles
          .where((vehicle) => vehicle.id != vehicleId)
          .toList();

      // Clear selected vehicle if it's the same
      final selectedVehicle = state.selectedVehicle?.id == vehicleId
          ? null
          : state.selectedVehicle;

      state = state.copyWith(
        vehicles: updatedVehicles,
        selectedVehicle: selectedVehicle,
        isDeleting: false,
      );

      Logger.info('Deleted vehicle: $vehicleId');
    } catch (e) {
      state = state.copyWith(
        isDeleting: false,
        error: e.toString(),
      );
      Logger.error('Failed to delete vehicle', e);
      rethrow;
    }
  }

  Future<void> loadVehicleStats() async {
    try {
      final stats = await _vehicleRepository.getVehicleStats();

      state = state.copyWith(stats: stats);

      Logger.info('Loaded vehicle statistics');
    } catch (e) {
      Logger.error('Failed to load vehicle stats', e);
    }
  }

  Future<void> loadVehicleServiceHistory(String vehicleId) async {
    try {
      final serviceHistory = await _vehicleRepository.getVehicleServiceHistory(vehicleId);

      state = state.copyWith(serviceHistory: serviceHistory);

      Logger.info('Loaded ${serviceHistory.length} service history records');
    } catch (e) {
      Logger.error('Failed to load service history', e);
    }
  }

  Future<List<Vehicle>> searchVehicles(String query) async {
    try {
      final vehicles = await _vehicleRepository.searchVehicles(query);

      Logger.info('Found ${vehicles.length} vehicles for query: $query');
      return vehicles;
    } catch (e) {
      Logger.error('Failed to search vehicles', e);
      rethrow;
    }
  }

  void filterByActive(bool? isActive) {
    state = state.copyWith(activeFilter: isActive);
    loadVehicles(refresh: true);
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void clearSelectedVehicle() {
    state = state.copyWith(selectedVehicle: null);
  }

  void clearServiceHistory() {
    state = state.copyWith(serviceHistory: []);
  }

  Future<void> refresh() async {
    await loadVehicles(refresh: true);
    await loadVehicleStats();
  }
}

// Specific providers for easier access
final vehiclesProvider = Provider<List<Vehicle>>((ref) {
  return ref.watch(vehicleProvider).vehicles;
});

final selectedVehicleProvider = Provider<Vehicle?>((ref) {
  return ref.watch(vehicleProvider).selectedVehicle;
});

final vehicleStatsProvider = Provider<VehicleStats?>((ref) {
  return ref.watch(vehicleProvider).stats;
});

final vehicleServiceHistoryProvider = Provider<List<VehicleServiceHistory>>((ref) {
  return ref.watch(vehicleProvider).serviceHistory;
});

final vehicleLoadingProvider = Provider<bool>((ref) {
  return ref.watch(vehicleProvider).isLoading;
});

final vehicleCreatingProvider = Provider<bool>((ref) {
  return ref.watch(vehicleProvider).isCreating;
});

final vehicleUpdatingProvider = Provider<bool>((ref) {
  return ref.watch(vehicleProvider).isUpdating;
});

final vehicleDeletingProvider = Provider<bool>((ref) {
  return ref.watch(vehicleProvider).isDeleting;
});

final vehicleErrorProvider = Provider<String?>((ref) {
  return ref.watch(vehicleProvider).error;
});

// Active filter provider
final vehicleActiveFilterProvider = Provider<bool?>((ref) {
  return ref.watch(vehicleProvider).activeFilter;
});
