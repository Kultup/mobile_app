import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserTest } from './schemas/user-test.schema';
import { Question } from '../questions/schemas/question.schema';
import { User } from '../users/schemas/user.schema';
import { PointsTransaction } from '../shop/schemas/points-transaction.schema';
import { SubmitAnswerDto } from '../common/dto/submit-answer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';
import { AchievementsCheckerService } from '../achievements/achievements-checker.service';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(UserTest.name) private userTestModel: Model<UserTest>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PointsTransaction.name) private pointsTransactionModel: Model<PointsTransaction>,
    @Inject(forwardRef(() => AchievementsCheckerService))
    private achievementsCheckerService: AchievementsCheckerService,
  ) {}

  async getDailyTest(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Перевірити чи є тест на сьогодні
    let test = await this.userTestModel.findOne({
      user_id: userId,
      test_date: today,
    }).exec();

    if (!test) {
      // Створити новий тест з 5 питаннями: по 1-2 з різних категорій
      const selectedQuestions: any[] = [];
      
      // Отримати всі унікальні категорії з активними питаннями
      const categories = await this.questionModel.distinct('category_id', {
        is_active: true,
      });

      if (categories.length === 0) {
        throw new BadRequestException('No questions available');
      }

      // Перемішати категорії для випадковості
      const shuffledCategories = categories.sort(() => Math.random() - 0.5);

      // Вибрати по 1-2 питання з кожної категорії
      for (const categoryId of shuffledCategories) {
        if (selectedQuestions.length >= 5) break;

        // Визначити скільки питань брати з цієї категорії (1 або 2)
        const remaining = 5 - selectedQuestions.length;
        const questionsToTake = remaining === 1 ? 1 : Math.floor(Math.random() * 2) + 1;

        // Вибрати випадкові питання з цієї категорії
        const categoryQuestions = await this.questionModel.aggregate([
          { $match: { category_id: categoryId, is_active: true } },
          { $sample: { size: questionsToTake } },
        ]);

        selectedQuestions.push(...categoryQuestions);
      }

      // Якщо не вистачає питань до 5, додати з будь-яких категорій
      if (selectedQuestions.length < 5) {
        const selectedIds = selectedQuestions.map((q) => q._id);
        const additionalQuestions = await this.questionModel.aggregate([
          {
            $match: {
              is_active: true,
              _id: { $nin: selectedIds },
            },
          },
          { $sample: { size: 5 - selectedQuestions.length } },
        ]);
        selectedQuestions.push(...additionalQuestions);
      }

      if (selectedQuestions.length < 5) {
        throw new BadRequestException('Not enough questions available');
      }

      // Обмежити до 5 питань та перемішати
      const finalQuestions = selectedQuestions.slice(0, 5).sort(() => Math.random() - 0.5);

      test = new this.userTestModel({
        user_id: userId,
        test_date: today,
        questions_count: 5,
        answers: finalQuestions.map((q) => ({
          question_id: q._id,
          selected_answer_ids: [],
          is_correct: false,
        })),
      });
      await test.save();
    }

    // Отримати питання з деталями
    const questionIds = test.answers.map((a: any) => a.question_id);
    const questions = await this.questionModel
      .find({ _id: { $in: questionIds } })
      .populate('knowledge_base_article_id', 'title')
      .exec();

    // Приховати правильні відповіді
    const questionsForUser = questions.map((q) => ({
      id: q._id,
      question_text: q.question_text,
      question_type: q.question_type,
      media_type: q.media_type,
      image_url: q.image_url,
      video_url: q.video_url,
      video_thumbnail_url: q.video_thumbnail_url,
      answers: q.answers.map((a: any, index: number) => ({
        id: index.toString(),
        answer_text: a.answer_text,
        // Не показуємо is_correct
      })),
    }));

    return {
      test: {
        id: test._id,
        test_date: test.test_date,
        questions: questionsForUser,
        deadline: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1), // 23:59:59
      },
    };
  }

  async startTest(testId: string, userId: string) {
    const test = await this.userTestModel.findOne({
      _id: testId,
      user_id: userId,
    }).exec();

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (test.started_at) {
      throw new BadRequestException('Test already started');
    }

    test.started_at = new Date();
    await test.save();

    return {
      test_id: test._id,
      started_at: test.started_at,
    };
  }

  async submitAnswer(testId: string, userId: string, answerDto: SubmitAnswerDto) {
    const test = await this.userTestModel.findOne({
      _id: testId,
      user_id: userId,
    }).exec();

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (test.is_completed) {
      throw new BadRequestException('Test already completed');
    }

    // Знайти питання
    const question = await this.questionModel.findById(answerDto.question_id).exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Перевірити правильність відповіді
    let isCorrect = false;
    if (question.question_type === 'single_choice') {
      const correctAnswerIndex = question.answers.findIndex((a: any) => a.is_correct);
      // Порівнюємо індекс правильної відповіді (selected_answer_ids містить індекс як рядок)
      const selectedIndex = answerDto.selected_answer_ids?.[0];
      isCorrect = selectedIndex === correctAnswerIndex.toString();
    }

    // Оновити відповідь в тесті
    const answerIndex = test.answers.findIndex(
      (a: any) => a.question_id.toString() === answerDto.question_id,
    );

    if (answerIndex !== -1) {
      // Конвертувати string[] в ObjectId[] або зберігати як string[]
      test.answers[answerIndex].selected_answer_ids = (answerDto.selected_answer_ids || []).map((id: any) => id);
      test.answers[answerIndex].is_correct = isCorrect;
      test.answers[answerIndex].answered_at = new Date();
    }

    await test.save();

    const correctAnswer = question.answers.find((a: any) => a.is_correct);
    return {
      is_correct: isCorrect,
      correct_answer: correctAnswer?.answer_text,
      explanation: question.explanation,
      knowledge_base_article_id: question.knowledge_base_article_id,
    };
  }

  async completeTest(testId: string, userId: string) {
    const test = await this.userTestModel.findOne({
      _id: testId,
      user_id: userId,
    }).exec();

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    if (test.is_completed) {
      throw new BadRequestException('Test already completed');
    }

    // Підрахувати правильні відповіді та бали
    const correctAnswers = test.answers.filter((a: any) => a.is_correct).length;
    const score = correctAnswers; // +1 бал за кожну правильну відповідь

    test.correct_answers = correctAnswers;
    test.score = score;
    test.is_completed = true;
    test.completed_at = new Date();

    await test.save();

    // Оновити статистику користувача
    await this.updateUserStatistics(userId, score, correctAnswers === test.questions_count, test._id);

    // Перевірити ачівки
    const achievementsResult = await this.achievementsCheckerService.checkAchievements(userId);

    return {
      test_id: test._id,
      correct_answers: correctAnswers,
      total_questions: test.questions_count,
      score: score,
      completed_at: test.completed_at,
      new_achievements: achievementsResult?.new_achievements || [],
    };
  }

  private async updateUserStatistics(userId: string, score: number, isPerfect: boolean, testId: any) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Перевірити чи був тест вчора
    const yesterdayTest = await this.userTestModel.findOne({
      user_id: userId,
      test_date: yesterday,
      is_completed: true,
    }).exec();

    // Оновити streak
    let currentStreak = user.current_streak;
    if (yesterdayTest) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    const longestStreak = Math.max(user.longest_streak, currentStreak);

    // Оновити статистику
    const pointsEarned = score + (isPerfect ? 2 : 0); // +2 бонус за ідеальний тест
    const updateData: any = {
      total_score: user.total_score + score,
      tests_completed: user.tests_completed + 1,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_test_date: today,
      points_balance: user.points_balance + pointsEarned,
    };

    await this.userModel.findByIdAndUpdate(userId, updateData).exec();

    // Створити транзакцію балів
    await this.pointsTransactionModel.create({
      user_id: userId,
      transaction_type: 'earned',
      amount: pointsEarned,
      source: 'test',
      source_id: testId,
      description: `Test completed: ${score} points${isPerfect ? ' + 2 bonus' : ''}`,
      balance_after: updateData.points_balance,
    });
  }

  async getHistory(userId: string, query: PaginationDto) {
    const { page = 1, per_page = 20 } = query;
    const skip = (page - 1) * per_page;

    const [data, total] = await Promise.all([
      this.userTestModel
        .find({ user_id: userId, is_completed: true })
        .skip(skip)
        .limit(per_page)
        .sort({ test_date: -1 })
        .exec(),
      this.userTestModel.countDocuments({ user_id: userId, is_completed: true }),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }
}

