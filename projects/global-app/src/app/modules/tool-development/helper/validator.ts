import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function versionValidator(latestVersion: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const versionPattern = /^\d+\.\d+\.\d+$/;
    const currentVersion = control.value;

    if (!versionPattern.test(currentVersion)) {
      return { pattern: true };
    }

    const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.').map(Number);
    const [latestMajor, latestMinor, latestPatch] = latestVersion.split('.').map(Number);

    if (
      currentMajor < latestMajor ||
      (currentMajor === latestMajor && currentMinor < latestMinor) ||
      (currentMajor === latestMajor && currentMinor === latestMinor && currentPatch < latestPatch)
    ) {
      return { versionTooLow: true };
    }

    return null;
  };
}
