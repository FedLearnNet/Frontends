import {Injectable} from "@angular/core";
import {ChartSuggestion, CsvFileSchemaField, CsvFileStatisticsField} from "@shared-lib/models/data-statistics";

@Injectable({
  providedIn: 'root'
})
export class DataStatistics {

  public getArrayStatistics(rows: Array<Record<string, any>>, col: string): CsvFileStatisticsField {
    const type: CsvFileSchemaField['type'] = this.detectArrayKind(rows, col);
    const profile: CsvFileStatisticsField = {name: col, type};

    const values = rows.map((r: any) => r[col])
      .filter((v: any) => v !== null && v !== undefined && v !== '');

    if (profile.type === "Int32" || profile.type === "Float64") {
      const nums = values.map(Number).sort((a, b) => a - b);
      const n = nums.length;
      const q = (p: number) => {
        const idx = (n - 1) * p, lo = Math.floor(idx), hi = Math.ceil(idx);
        return lo === hi ? nums[lo] : nums[lo] + (nums[hi] - nums[lo]) * (idx - lo);
      };
      const mean = nums.reduce((s, v) => s + v, 0) / n;
      const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / (n > 1 ? n - 1 : 1);

      profile.missing = rows.length - n;
      profile.count = n;
      profile.mean = mean;
      profile.median = q(0.5);
      profile.min = nums[0];
      profile.q1 = q(0.25);
      profile.q3 = q(0.75);
      profile.max = nums[n - 1];
      profile.std = Math.sqrt(variance);
      profile.iqr = q(0.75) - q(0.25);

      const bins = Math.min(Math.ceil(Math.sqrt(n)), 15);
      const step = (profile.max - profile.min) / (bins || 1) || 1;
      const counts = new Array(bins).fill(0);
      nums.forEach(v => {
        let idx = Math.floor((v - profile.min!) / step);
        if (idx === bins) idx = bins - 1;
        counts[idx]++;
      });
      profile.previewHistogram = {bins: counts, min: profile.min, step};
    } else {
      const freq = new Map<string, number>();
      values.forEach(v => freq.set(String(v), (freq.get(String(v)) || 0) + 1));
      const entries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
      profile.topCategories = entries.slice(0, 6)
        .map(([val, count]) => ({value: val, count}));
      profile.distinctCount = entries.length;
    }
    return profile;
  }

  public detectArrayKind(a: Array<Record<string, any>>, col: string): "Utf8" | "Int32" | "Float64" | "Bool" | "Mixed" {
    if (a.length === 0) return "Mixed";
    let hasStr = 0, hasInt = 0, hasFloat = 0, hasBool = 0;
    for (let i = 0; i < a.length; i++) {
      const v = a[i][col];
      if (!Number.isNaN(+v)) {
        if (Number.isInteger(v)) {
          hasInt = 1
        } else {
          hasFloat = 1;
        }
      } else {
        const t = typeof v;
        if (t === "string") {
          hasStr = 1;
          if ((v as string).toLowerCase() == "true" || (v as string).toLowerCase() == "false") {
            hasBool = 1;
          }
        } else if (t === "boolean") {
          hasBool = 1;
        } else {
          return "Mixed";
        }
      }
      const kinds = hasStr + hasBool + hasInt + hasFloat;
      if (kinds > 1 || (hasInt && hasFloat)) { // more than one category
        return "Mixed";
      }
    }

    if (hasStr) return "Utf8";
    if (hasBool) return "Bool";
    if (hasInt) return "Int32";
    if (hasFloat) return "Float64";
    return "Mixed";
  }

  public generateSuggestions(statistics: Map<string, CsvFileStatisticsField>, rows: any[]): ChartSuggestion[] {
    const profiles: CsvFileStatisticsField[] = Array.from(statistics.values());
    const numeric = profiles.filter(p => p.type === "Float64" || p.type === "Int32");
    const categorical = profiles.filter(p => p.type === 'Utf8' || p.type === 'Bool');

    const suggestions: ChartSuggestion[] = [];

    // Univariate numeric: histogram
    numeric.forEach(p => {
      suggestions.push({
        id: `hist_${p.name}`,
        title: `Histogram of ${p.name}`,
        description: `Distribution of ${p.name}`,
        type: 'univariate',
        requiredColumns: [p.name],
        score: 0.8,
        optionFactory: () => this.buildHistogramOption(rows, p.name)
      });
      suggestions.push({
        id: `box_${p.name}`,
        title: `Boxplot of ${p.name}`,
        description: `Quartiles & outliers for ${p.name}`,
        type: 'univariate',
        requiredColumns: [p.name],
        score: 0.7,
        optionFactory: () => this.buildBoxplotOption(rows, p.name)
      });
    });

    // Univariate categorical: bar count
    categorical.forEach(p => {
      suggestions.push({
        id: `barcount_${p.name}`,
        title: `Count by ${p.name}`,
        description: `Frequency of categories in ${p.name}`,
        type: 'univariate',
        requiredColumns: [p.name],
        score: 0.85,
        optionFactory: () => this.buildCategoryCountOption(rows, p.name)
      });
    });

    // Bivariate numeric-numeric: scatter
    for (let i = 0; i < numeric.length; i++) {
      for (let j = i + 1; j < numeric.length; j++) {
        const a = numeric[i].name, b = numeric[j].name;
        suggestions.push({
          id: `scatter_${a}_${b}`,
          title: `Scatter ${a} vs ${b}`,
          description: `Relationship between ${a} and ${b}`,
          type: 'bivariate',
          requiredColumns: [a, b],
          score: 0.9,
          optionFactory: () => this.buildScatterOption(rows, a, b)
        });
      }
    }

    // Bivariate numeric + categorical: boxplot / grouped bar / violin (if you add)
    numeric.forEach(nc => {
      categorical.forEach(cc => {
        suggestions.push({
          id: `box_${nc.name}_by_${cc.name}`,
          title: `Boxplot ${nc.name} by ${cc.name}`,
          description: `Distribution of ${nc.name} across ${cc.name} categories`,
          type: 'bivariate',
          requiredColumns: [nc.name, cc.name],
          score: 0.88,
          optionFactory: () => this.buildGroupedBoxplotOption(rows, nc.name, cc.name)
        });
        suggestions.push({
          id: `mean_${nc.name}_by_${cc.name}`,
          title: `Mean ${nc.name} by ${cc.name}`,
          description: `Average ${nc.name} in each ${cc.name} category`,
          type: 'bivariate',
          requiredColumns: [nc.name, cc.name],
          score: 0.75,
          optionFactory: () => this.buildMeanBarOption(rows, nc.name, cc.name)
        });
      });
    });

    // Multivariate: correlation heatmap if >=3 numeric
    if (numeric.length >= 3) {
      suggestions.push({
        id: `corr_matrix`,
        title: `Correlation Matrix`,
        description: `Pearson correlations among numeric columns`,
        type: 'multivariate',
        requiredColumns: numeric.map(n => n.name),
        score: 0.95,
        optionFactory: () => this.buildCorrelationHeatmapOption(rows, numeric.map(n => n.name))
      });
      suggestions.push({
        id: `parallel_coords`,
        title: `Parallel Coordinates`,
        description: `Compare multi-dimensional numeric profiles`,
        type: 'multivariate',
        requiredColumns: numeric.map(n => n.name),
        score: 0.7,
        optionFactory: () => this.buildParallelCoordinatesOption(rows, numeric.map(n => n.name))
      });
    }

    // Rank suggestions by score (you could adjust scoring rules later)
    return suggestions.sort((a, b) => b.score - a.score);
  }


  public buildHistogramOption(rows: any[], col: string): any {
    const data = rows.map(r => +r[col]).filter(v => !isNaN(v));
    // Simple binning
    const min = Math.min(...data), max = Math.max(...data);
    const bins = Math.ceil(Math.sqrt(data.length)); // Freedman–Diaconis alternative if you compute IQR
    const step = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);
    data.forEach(v => {
      let idx = Math.floor((v - min) / step);
      if (idx === bins) idx = bins - 1;
      counts[idx]++;
    });
    const labels = counts.map((_, i) => (min + i * step).toFixed(2));
    return {
      tooltip: {trigger: 'axis'},
      xAxis: {type: 'category', name: col, data: labels},
      yAxis: {type: 'value', name: 'Count'},
      series: [{type: 'bar', data: counts}]
    };
  }

  public buildBoxplotOption(rows: any[], col: string): any {
    const data = rows.map(r => +r[col]).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quantile = (p: number) => {
      const idx = (data.length - 1) * p;
      const lo = Math.floor(idx), hi = Math.ceil(idx);
      return lo === hi ? data[lo] : data[lo] + (data[hi] - data[lo]) * (idx - lo);
    };
    const stats = [quantile(0), quantile(0.25), quantile(0.5), quantile(0.75), quantile(1)];
    return {
      tooltip: {formatter: (_p: any) => `${col}<br>Min: ${stats[0]}<br>Q1: ${stats[1]}<br>Median: ${stats[2]}<br>Q3: ${stats[3]}<br>Max: ${stats[4]}`},
      xAxis: {type: 'category', data: [col]},
      yAxis: {type: 'value'},
      series: [{
        type: 'boxplot',
        data: [stats]
      }]
    };
  }

  public buildCategoryCountOption(rows: any[], col: string): any {
    const freq = new Map<string, number>();
    rows.forEach(r => {
      const v = r[col];
      if (v !== null && v !== undefined && v !== '') {
        freq.set(String(v), (freq.get(String(v)) || 0) + 1);
      }
    });
    const entries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
    return {
      tooltip: {trigger: 'axis'},
      xAxis: {type: 'category', data: entries.map(e => e[0])},
      yAxis: {type: 'value', name: 'Count'},
      series: [{type: 'bar', data: entries.map(e => e[1])}]
    };
  }

  public buildScatterOption(rows: any[], x: string, y: string): any {
    const data = rows
      .map(r => ({x: +r[x], y: +r[y], raw: r}))
      .filter(d => !isNaN(d.x) && !isNaN(d.y));
    return {
      tooltip: {
        trigger: 'item'
      },
      xAxis: {name: x},
      yAxis: {name: y},
      series: [{
        type: 'scatter',
        data: data.map(d => [d.x, d.y])
      }]
    };
  }

  public buildGroupedBoxplotOption(rows: any[], numericCol: string, catCol: string): any {
    const groups: Record<string, number[]> = {};
    rows.forEach(r => {
      const g = r[catCol];
      const v = +r[numericCol];
      if (g !== undefined && g !== null && g !== '' && !isNaN(v)) {
        groups[g] = groups[g] || [];
        groups[g].push(v);
      }
    });
    const cats = Object.keys(groups);
    const boxData = cats.map(c => {
      const arr = groups[c].sort((a, b) => a - b);
      const q = (p: number) => {
        const idx = (arr.length - 1) * p;
        const lo = Math.floor(idx), hi = Math.ceil(idx);
        return lo === hi ? arr[lo] : arr[lo] + (arr[hi] - arr[lo]) * (idx - lo);
      };
      return [q(0), q(0.25), q(0.5), q(0.75), q(1)];
    });
    return {
      tooltip: {trigger: 'item'},
      xAxis: {type: 'category', data: cats},
      yAxis: {type: 'value', name: numericCol},
      series: [{type: 'boxplot', data: boxData}]
    };
  }

  public buildMeanBarOption(rows: any[], numericCol: string, catCol: string): any {
    const sums: Record<string, { sum: number, count: number }> = {};
    rows.forEach(r => {
      const c = r[catCol];
      const v = +r[numericCol];
      if (c !== undefined && c !== null && c !== '' && !isNaN(v)) {
        sums[c] = sums[c] || {sum: 0, count: 0};
        sums[c].sum += v;
        sums[c].count += 1;
      }
    });
    const cats = Object.keys(sums);
    const data = cats.map(c => (sums[c].sum / sums[c].count));
    return {
      tooltip: {trigger: 'axis'},
      xAxis: {type: 'category', data: cats},
      yAxis: {type: 'value', name: `Mean ${numericCol}`},
      series: [{type: 'bar', data}]
    };
  }

  public buildCorrelationHeatmapOption(rows: any[], numericCols: string[]): any {
    const vals = numericCols.map(c => rows.map(r => +r[c]).filter(v => !isNaN(v)));
    const means = vals.map(arr => arr.reduce((s, v) => s + v, 0) / arr.length);
    const corr: number[][] = [];
    for (let i = 0; i < numericCols.length; i++) {
      corr[i] = [];
      for (let j = 0; j < numericCols.length; j++) {
        const a = vals[i], b = vals[j];
        const n = Math.min(a.length, b.length);
        let num = 0, da = 0, db = 0;
        for (let k = 0; k < n; k++) {
          const av = a[k] - means[i];
          const bv = b[k] - means[j];
          num += av * bv;
          da += av * av;
          db += bv * bv;
        }
        corr[i][j] = num / Math.sqrt((da || 1) * (db || 1));
      }
    }
    return {
      tooltip: {
        position: 'top',
        formatter: (p: any) => `${numericCols[p.data[1]]} vs ${numericCols[p.data[0]]}: ${p.data[2].toFixed(2)}`
      },
      xAxis: {type: 'category', data: numericCols},
      yAxis: {type: 'category', data: numericCols},
      visualMap: {min: -1, max: 1, calculable: true, orient: 'horizontal', left: 'center', bottom: 0},
      series: [{
        type: 'heatmap',
        data: corr.flatMap((row, i) => row.map((v, j) => [i, j, v])),
        label: {show: true, formatter: (p: any) => p.data[2].toFixed(2)}
      }]
    };
  }

  public buildParallelCoordinatesOption(rows: any[], numericCols: string[]): any {
    return {
      parallelAxis: numericCols.map((c, i) => ({dim: i, name: c})),
      parallel: {left: 80, top: 40, right: 40, bottom: 30},
      tooltip: {},
      series: [{
        type: 'parallel',
        data: rows.map(r => numericCols.map(c => r[c]))
      }]
    };
  }

}
