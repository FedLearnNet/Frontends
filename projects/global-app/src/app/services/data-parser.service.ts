import {Injectable} from '@angular/core';

//TODO REWORK
@Injectable({
  providedIn: 'root'
})
export class DataParserService {


  parseHTRIdbData(data: any[]): { nodes: any[], links: any[] } {
    const nodes = new Set<string>();
    const links: any[] = [];

    data.forEach(row => {
      // Add TF and TG to nodes if they don't exist
      if (row.SYMBOL_TF) nodes.add(row.SYMBOL_TF);
      if (row.SYMBOL_TG) nodes.add(row.SYMBOL_TG);

      // Create link between TF and TG
      if (row.SYMBOL_TF && row.SYMBOL_TG) {
        links.push({
          source: row.SYMBOL_TF,
          target: row.SYMBOL_TG,
          technique: row.TECHNIQUE,
          pubmedId: row.PUBMED_ID
        });
      }
    });

    return {
      nodes: Array.from(nodes).map(name => ({
        name,
        category: name.includes('TF') ? 0 : 1
      })),
      links
    };
  }

  parseClinicalData(data: any[]): { ageData: number[], survivalData: number[] } {
    const stageData = new Map<string, { ages: number[], survivals: number[] }>();

    data.forEach(row => {
      const stage = row.AJCC_PATHOLOGIC_TUMOR_STAGE;
      if (stage) {
        if (!stageData.has(stage)) {
          stageData.set(stage, {ages: [], survivals: []});
        }

        if (row.AGE_AT_DIAGNOSIS) {
          stageData.get(stage)!.ages.push(Number(row.AGE_AT_DIAGNOSIS));
        }

        if (row.VITAL_STATUS) {
          stageData.get(stage)!.survivals.push(row.VITAL_STATUS === 'Alive' ? 1 : 0);
        }
      }
    });

    const stages = ['Stage I', 'Stage II', 'Stage III', 'Stage IV'];
    return {
      ageData: stages.map(stage => {
        const data = stageData.get(stage);
        return data ? data.ages.reduce((a, b) => a + b, 0) / data.ages.length : 0;
      }),
      survivalData: stages.map(stage => {
        const data = stageData.get(stage);
        return data ? data.survivals.reduce((a, b) => a + b, 0) / data.survivals.length : 0;
      })
    };
  }

  parseExpressionData(caseData: any[], controlData: any[]): { genes: string[], data: any[] } {
    // Get common genes from both datasets
    const genes = new Set<string>();
    const caseValues = new Map<string, number[]>();
    const controlValues = new Map<string, number[]>();

    // Process case data
    caseData.forEach(row => {
      Object.entries(row).forEach(([gene, value]) => {
        if (gene !== 'sample_id') {
          genes.add(gene);
          if (!caseValues.has(gene)) {
            caseValues.set(gene, []);
          }
          caseValues.get(gene)!.push(Number(value));
        }
      });
    });

    // Process control data
    controlData.forEach(row => {
      Object.entries(row).forEach(([gene, value]) => {
        if (gene !== 'sample_id') {
          genes.add(gene);
          if (!controlValues.has(gene)) {
            controlValues.set(gene, []);
          }
          controlValues.get(gene)!.push(Number(value));
        }
      });
    });

    // Calculate average expression for each gene
    const geneArray = Array.from(genes);
    const data: any[] = [];

    geneArray.forEach((gene, geneIndex) => {
      // Case data
      const caseAvg = caseValues.has(gene)
        ? caseValues.get(gene)!.reduce((a, b) => a + b, 0) / caseValues.get(gene)!.length
        : 0;
      data.push([0, geneIndex, caseAvg]);

      // Control data
      const controlAvg = controlValues.has(gene)
        ? controlValues.get(gene)!.reduce((a, b) => a + b, 0) / controlValues.get(gene)!.length
        : 0;
      data.push([1, geneIndex, controlAvg]);
    });

    return {
      genes: geneArray,
      data
    };
  }
}
