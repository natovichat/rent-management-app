import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OwnershipsService } from './ownerships.service';
import { CreateOwnershipDto } from './dto/create-ownership.dto';
import { UpdateOwnershipDto } from './dto/update-ownership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../auth/guards/account.guard';
import { AccountId } from '../auth/decorators/account-id.decorator';

@ApiTags('ownerships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccountGuard)
@Controller('ownerships')
export class OwnershipsController {
  constructor(private readonly ownershipsService: OwnershipsService) {}

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'קבלת כל הבעלויות של נכס' })
  @ApiResponse({
    status: 200,
    description: 'רשימת בעלויות',
  })
  @ApiResponse({
    status: 404,
    description: 'נכס לא נמצא',
  })
  findAllByProperty(
    @Param('propertyId') propertyId: string,
    @AccountId() accountId: string,
  ) {
    return this.ownershipsService.findAllByProperty(propertyId, accountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'קבלת בעלות לפי מזהה' })
  @ApiResponse({
    status: 200,
    description: 'פרטי בעלות',
  })
  @ApiResponse({
    status: 404,
    description: 'בעלות לא נמצאה',
  })
  findOne(@Param('id') id: string, @AccountId() accountId: string) {
    return this.ownershipsService.findOne(id, accountId);
  }

  @Post()
  @ApiOperation({ summary: 'יצירת בעלות חדשה' })
  @ApiResponse({
    status: 201,
    description: 'הבעלות נוצרה בהצלחה',
  })
  @ApiResponse({
    status: 400,
    description: 'סך כל אחוזי הבעלות חייב להיות 100%',
  })
  @ApiResponse({
    status: 404,
    description: 'נכס או בעלים לא נמצאו',
  })
  create(
    @AccountId() accountId: string,
    @Body() createOwnershipDto: CreateOwnershipDto,
  ) {
    return this.ownershipsService.create(createOwnershipDto, accountId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'עדכון בעלות' })
  @ApiResponse({
    status: 200,
    description: 'הבעלות עודכנה בהצלחה',
  })
  @ApiResponse({
    status: 400,
    description: 'סך כל אחוזי הבעלות חייב להיות 100%',
  })
  @ApiResponse({
    status: 404,
    description: 'בעלות לא נמצאה',
  })
  update(
    @Param('id') id: string,
    @AccountId() accountId: string,
    @Body() updateOwnershipDto: UpdateOwnershipDto,
  ) {
    return this.ownershipsService.update(id, updateOwnershipDto, accountId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'מחיקת בעלות' })
  @ApiResponse({
    status: 200,
    description: 'הבעלות נמחקה בהצלחה',
  })
  @ApiResponse({
    status: 404,
    description: 'בעלות לא נמצאה',
  })
  remove(@Param('id') id: string, @AccountId() accountId: string) {
    return this.ownershipsService.remove(id, accountId);
  }
}
