import {
  PatientDataExportConfigDTO,
  PatientExportFeatureDTO,
  SelectedDataIdsDTO
} from "@shared-lib/modules/data-modeler/dto/data-export.dto";

const FEATURE_NAME_PREFIX = 'Feature';

export function toSelectionKey(selection: SelectedDataIdsDTO): string {
  return `${selection.globalOntologyId}::${selection.globalDataTypeId}`;
}

export function dedupeSelectedDataIds(selectedDataIds?: SelectedDataIdsDTO[] | null): SelectedDataIdsDTO[] {
  const unique = new Map<string, SelectedDataIdsDTO>();

  for (const selection of selectedDataIds ?? []) {
    if (!selection?.globalOntologyId || !selection?.globalDataTypeId) {
      continue;
    }
    unique.set(toSelectionKey(selection), {
      globalOntologyId: selection.globalOntologyId,
      globalDataTypeId: selection.globalDataTypeId,
    });
  }

  return Array.from(unique.values());
}

export function normalizeExportFeature(
  feature: Partial<PatientExportFeatureDTO> | null | undefined,
  order: number
): PatientExportFeatureDTO {
  const allowedDataIds = dedupeSelectedDataIds(feature?.allowedDataIds);
  const distinctDatatypeIds = distinctDatatypeIdsFromSelections(allowedDataIds);
  const targetDatatypeId = distinctDatatypeIds.length === 1
    ? distinctDatatypeIds[0]
    : feature?.targetDatatypeId;
  const hasExplicitName = !!feature && Object.prototype.hasOwnProperty.call(feature, 'name');

  return {
    name: hasExplicitName ? (feature?.name ?? '').trim() : `${FEATURE_NAME_PREFIX} ${order + 1}`,
    order,
    allowedDataIds,
    targetDatatypeId,
  };
}

export function distinctDatatypeIdsFromSelections(selectedDataIds?: SelectedDataIdsDTO[] | null): string[] {
  return Array.from(
    new Set(
      (selectedDataIds ?? [])
        .map(selection => selection?.globalDataTypeId)
        .filter((id): id is string => !!id)
    )
  );
}

export function flattenExportFeatures(features?: PatientExportFeatureDTO[] | null): SelectedDataIdsDTO[] {
  return dedupeSelectedDataIds(
    (features ?? []).flatMap(feature => feature.allowedDataIds ?? [])
  );
}

export function hasExportSelections(config?: PatientDataExportConfigDTO | null): boolean {
  if (!config) {
    return false;
  }

  if ((config.features?.length ?? 0) > 0) {
    return config.features!.some(feature => (feature.allowedDataIds?.length ?? 0) > 0);
  }

  return (config.features?.length ?? 0) > 0;
}
