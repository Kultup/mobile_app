import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseArticle, KnowledgeBaseArticleSchema } from './schemas/knowledge-base-article.schema';
import { KnowledgeBaseCategory, KnowledgeBaseCategorySchema } from './schemas/knowledge-base-category.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeBaseArticle.name, schema: KnowledgeBaseArticleSchema },
      { name: KnowledgeBaseCategory.name, schema: KnowledgeBaseCategorySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}

