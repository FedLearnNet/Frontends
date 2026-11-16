import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ConnectorDTO} from '../../dto/connector';
import {TransformerAssistantMessageDTO} from '../../dto/transformer-assistant';

export const TransformerAssistantActions = createActionGroup({
  source: 'Transformer Assistant',
  events: {
    'Start': props<{connector: ConnectorDTO; path?: string}>(),
    'Received': props<{message: TransformerAssistantMessageDTO}>(),
    'Connection Failed': props<{error: string}>(),
    'Send Message': props<{message: string; columns?: string[]}>(),
    'Apply': emptyProps(),
    'Toggle Node': props<{schemaId: number}>(),
    'Stop': emptyProps(),
    'Reset': emptyProps(),
  },
});
