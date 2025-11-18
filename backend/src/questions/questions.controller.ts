import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';
import { QuestionsImportService } from './questions-import.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateQuestionDto } from '../common/dto/create-question.dto';
import { UpdateQuestionDto } from '../common/dto/update-question.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly questionsImportService: QuestionsImportService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: PaginationDto & { category_id?: string; is_active?: boolean; search?: string }) {
    return this.questionsService.findAll(query);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    return this.questionsService.getCategories();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  async create(@Body() createDto: CreateQuestionDto) {
    return this.questionsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  async update(@Param('id') id: string, @Body() updateDto: UpdateQuestionDto) {
    return this.questionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  async remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'training_admin')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: Express.Multer.File) {
    return this.questionsImportService.importFromExcel(file);
  }
}

