import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get('articles')
  @UseGuards(JwtAuthGuard)
  async getArticles(@Query() query: PaginationDto & { category_id?: string; search?: string }) {
    return this.knowledgeBaseService.getArticles(query);
  }

  @Get('articles/:id')
  @UseGuards(JwtAuthGuard)
  async getArticle(@Param('id') id: string) {
    return this.knowledgeBaseService.getArticle(id);
  }
}

