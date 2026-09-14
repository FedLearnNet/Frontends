import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";

export interface ToolTypeNeedsConfig {
  needsInputConfig: boolean;
  canEditInputConfig: boolean;
  needsOutputConfig: boolean;
  canEditOutputConfig: boolean;
  //for config training/prediction/both
  supportsTraining: boolean;
  supportsFederated: boolean;
  //For data transformation
  canEditOnlySchema: boolean;
}

export const TOOL_TYPE_CONFIG_DEFAULT_OPTIONS: ToolTypeNeedsConfig =
  {
    needsInputConfig: true,
    canEditInputConfig: true,
    needsOutputConfig: true,
    canEditOutputConfig: true,
    supportsTraining: false,
    supportsFederated: false,
    canEditOnlySchema: false
  };

/**
 * This class defines the configuration policy for different tool types in the federated learning application.
 * It specifies whether a tool type needs input/output configuration, whether it supports training, and other related settings.

 Frontend: projects/global-app/src/app/modules/tool-development/model/tool-config-type.ts
 Backend: global-learning-api/src/main/java/de/unihamburg/daibetes/api/app/config/ToolTypeConfigPolicy.java
 Python: pyfedappwrap/engine/config/config-policy.py
 */
export const TOOL_TYPE_CONFIG_MAP: Record<FederatedAppType, ToolTypeNeedsConfig> = {
  [FederatedAppType.PRE_PROCESSING]: {
    needsInputConfig: true,
    canEditInputConfig: true,
    needsOutputConfig: true,
    canEditOutputConfig: true,
    supportsTraining: false,
    supportsFederated: true,
    canEditOnlySchema: false
  },
  [FederatedAppType.ANALYSIS]: {
    needsInputConfig: true,
    canEditInputConfig: true,
    needsOutputConfig: true,
    canEditOutputConfig: true,
    supportsTraining: true,
    supportsFederated: true,
    canEditOnlySchema: false
  },
  [FederatedAppType.SELF_LEARNED]: {
    needsInputConfig: true,
    canEditInputConfig: true,
    needsOutputConfig: true,
    canEditOutputConfig: true,
    supportsTraining: false,
    supportsFederated: true,
    canEditOnlySchema: false
  },
  [FederatedAppType.DATA_TRANSFORMATION]: {
    needsInputConfig: true,
    canEditInputConfig: false,
    needsOutputConfig: true,
    canEditOutputConfig: false,
    supportsTraining: false,
    supportsFederated: false,
    canEditOnlySchema: true
  },
  [FederatedAppType.EXTRACTOR]: {
    needsInputConfig: true,
    canEditInputConfig: true,
    needsOutputConfig: true,
    canEditOutputConfig: true,
    supportsTraining: false,
    supportsFederated: false,
    canEditOnlySchema: false
  },
  [FederatedAppType.POST_PROCESSING]: {
    needsInputConfig: true,
    canEditInputConfig: true,
    needsOutputConfig: true,
    canEditOutputConfig: true,
    supportsTraining: false,
    supportsFederated: true,
    canEditOnlySchema: false
  },
  [FederatedAppType.EVALUATION]: {
    needsInputConfig: true,
    canEditInputConfig: true,
    needsOutputConfig: true,
    canEditOutputConfig: true,
    supportsTraining: false,
    supportsFederated: true,
    canEditOnlySchema: false
  },
  [FederatedAppType.EXPORT]: {
    needsInputConfig: false,
    canEditInputConfig: false,
    needsOutputConfig: true,
    canEditOutputConfig: true,
    supportsTraining: false,
    supportsFederated: false,
    canEditOnlySchema: false
  },
};



