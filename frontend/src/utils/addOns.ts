import { ServiceType } from '../types';

export function calculateAddOnTotal(selectedAddOns: string[], addOnOptions: ServiceType[]) {
  return addOnOptions
    .filter((option) => selectedAddOns.includes(option.serviceName))
    .reduce((sum, option) => sum + option.basePrice, 0);
}

export function isKnownAddOn(addOn: string, addOnOptions: ServiceType[]) {
  return addOnOptions.some((option) => option.serviceName === addOn);
}

export function getRecommendedAddOnNames(vehicleType: string, servicePackage: string, addOnOptions: ServiceType[]) {
  const normalizedVehicleType = vehicleType.toUpperCase();
  const normalizedService = servicePackage.toLowerCase();

  return addOnOptions
    .filter((option) => {
      const name = option.serviceName.toLowerCase();
      if (option.isFeatured) {
        return true;
      }
      if ((normalizedVehicleType === 'SUV' || normalizedVehicleType === 'TRUCK' || normalizedVehicleType === 'VAN') && name.includes('interior')) {
        return true;
      }
      if (normalizedService.includes('basic') && (name.includes('tire') || name.includes('rim'))) {
        return true;
      }
      if (normalizedService.includes('premium') && name.includes('dashboard')) {
        return true;
      }
      return false;
    })
    .map((option) => option.serviceName);
}
