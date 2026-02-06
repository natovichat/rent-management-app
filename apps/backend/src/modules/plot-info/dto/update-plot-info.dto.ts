import { PartialType } from '@nestjs/swagger';
import { CreatePlotInfoDto } from './create-plot-info.dto';

export class UpdatePlotInfoDto extends PartialType(CreatePlotInfoDto) {}
