import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminExportService } from './admin-export.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AchievementsAdminController } from './achievements-admin.controller';
import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UserTest, UserTestSchema } from '../tests/schemas/user-test.schema';
import { SystemSettings, SystemSettingsSchema } from '../common/schemas/system-settings.schema';
import { SurveyResponse, SurveyResponseSchema } from '../surveys/schemas/survey-response.schema';
import { Survey, SurveySchema } from '../surveys/schemas/survey.schema';
import { Achievement, AchievementSchema } from '../achievements/schemas/achievement.schema';
import { UserAchievement, UserAchievementSchema } from '../achievements/schemas/user-achievement.schema';
import { ShopAdminController } from './shop-admin.controller';
import { ShopProduct, ShopProductSchema } from '../shop/schemas/shop-product.schema';
import { UserPurchase, UserPurchaseSchema } from '../shop/schemas/user-purchase.schema';
import { KnowledgeBaseAdminController } from './knowledge-base-admin.controller';
import { KnowledgeBaseArticle, KnowledgeBaseArticleSchema } from '../knowledge-base/schemas/knowledge-base-article.schema';
import { KnowledgeBaseCategory, KnowledgeBaseCategorySchema } from '../knowledge-base/schemas/knowledge-base-category.schema';
import { QuestionCategoriesAdminController } from './question-categories-admin.controller';
import { QuestionCategory, QuestionCategorySchema } from '../questions/schemas/question-category.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { KnowledgeBaseCategoriesAdminController } from './knowledge-base-categories-admin.controller';
import { FeedbackQuestion, FeedbackQuestionSchema } from '../common/schemas/feedback-question.schema';
import { FeedbackErrorReport, FeedbackErrorReportSchema } from '../common/schemas/feedback-error-report.schema';
import { AdminActivityLog, AdminActivityLogSchema } from '../common/schemas/admin-activity-log.schema';
import { ShopProductCategory, ShopProductCategorySchema } from '../shop/schemas/shop-product-category.schema';
import { ShopCategoriesAdminController } from './shop-categories-admin.controller';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    FilesModule,
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: User.name, schema: UserSchema },
      { name: UserTest.name, schema: UserTestSchema },
      { name: SystemSettings.name, schema: SystemSettingsSchema },
      { name: SurveyResponse.name, schema: SurveyResponseSchema },
      { name: Survey.name, schema: SurveySchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
      { name: ShopProduct.name, schema: ShopProductSchema },
      { name: UserPurchase.name, schema: UserPurchaseSchema },
      { name: KnowledgeBaseArticle.name, schema: KnowledgeBaseArticleSchema },
      { name: KnowledgeBaseCategory.name, schema: KnowledgeBaseCategorySchema },
      { name: QuestionCategory.name, schema: QuestionCategorySchema },
      { name: Question.name, schema: QuestionSchema },
      { name: FeedbackQuestion.name, schema: FeedbackQuestionSchema },
      { name: FeedbackErrorReport.name, schema: FeedbackErrorReportSchema },
      { name: AdminActivityLog.name, schema: AdminActivityLogSchema },
      { name: ShopProductCategory.name, schema: ShopProductCategorySchema },
    ]),
  ],
  controllers: [
    AdminController,
    SettingsController,
    AchievementsAdminController,
    ShopAdminController,
    KnowledgeBaseAdminController,
    QuestionCategoriesAdminController,
    KnowledgeBaseCategoriesAdminController,
    ShopCategoriesAdminController,
  ],
  providers: [AdminService, AdminExportService, SettingsService],
  exports: [AdminService, SettingsService, AdminExportService],
})
export class AdminModule {}

