export interface ConfigPydanticDTO {
    hyperparam: string;
    input: string;
    output: string;
}

export interface ClientConfigDTO {
    APP_KEY: string;

    ENABLE_CONFIG_SYNC: string;
    TRACE_PERFORMANCE: string;
}


export interface ExperimentDiagramConfigDTO {
  // The workflow node of the tool it charts; null for an experiment of a single app.
  workflowNodeId?: number | null;
    name: string;
    dataAggregatorType?: 'max' | 'min' | 'avg' | 'all';
    xAxisHeader: string;
    yAxisHeader: string;
    seriesType: 'bar' | 'line' | 'scatter';
}


