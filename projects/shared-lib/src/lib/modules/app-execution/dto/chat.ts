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

/** How a human-in-the-loop question is answered. */
export enum HumanInTheLoopType {
  /** Free text in the chat input. */
  TEXT = 'TEXT',
  /** Exactly one of the options, which are column names. */
  SELECT_COLUMN = 'SELECT_COLUMN',
  /** One or more of the options, which are column names. */
  SELECT_COLUMNS = 'SELECT_COLUMNS',
}

export interface HumanInTheLoopDTO {
  answer?: string | null;
  question: string;
  timestamp: Date;
  type?: HumanInTheLoopType;
  options?: string[] | null;
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
