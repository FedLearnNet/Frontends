import {ProjectDetailDto} from "@global-app/project/dto/project";
import {FederatedLearningExperimentDto} from "../dto/federated-learning-experiment";

export interface FederatedLearningProjectDto {
  project: ProjectDetailDto,
  experiment: FederatedLearningExperimentDto
}
