import {BaseDto} from "@shared-lib/base/base-dto";

export interface BasePlanStep {
  action: string;
  reason: string;
  subTaskQuestion: string;
}

export interface ReasoningDTO {
  planStep: BasePlanStep;
  message: string;
  timestamp: Date;
}

export interface ToolDTO {
  id: string;
  name: string;
  started: boolean;
  done: boolean;
  content: string[];
  input: any;
}

export interface HumanInTheLoopDTO {
  answer?: string | null;
  question: string;
  timestamp: Date;
}

export interface BaseChatMessageDTO extends BaseDto {
  message: string;

  request: boolean;
  done: boolean;

  errorMessage: string;
  statusMessage: string;

  tools: ToolDTO[];
  reasonings: ReasoningDTO[];
  humanInTheLoop: HumanInTheLoopDTO[];
}
