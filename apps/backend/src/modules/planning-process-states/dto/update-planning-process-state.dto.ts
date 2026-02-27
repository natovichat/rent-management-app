import { PartialType } from '@nestjs/swagger';
import { CreatePlanningProcessStateDto } from './create-planning-process-state.dto';

/**
 * DTO for updating a PlanningProcessState (all fields optional)
 */
export class UpdatePlanningProcessStateDto extends PartialType(
  CreatePlanningProcessStateDto,
) {}
