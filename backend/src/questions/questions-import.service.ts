import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { Question } from './schemas/question.schema';
import { QuestionCategory } from './schemas/question-category.schema';
import { CreateQuestionDto } from '../common/dto/create-question.dto';

@Injectable()
export class QuestionsImportService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(QuestionCategory.name) private categoryModel: Model<QuestionCategory>,
  ) {}

  async importFromExcel(file: Express.Multer.File): Promise<{ imported: number; errors: string[] }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      try {
        const questionDto: CreateQuestionDto = {
          category_id: row.category_id || row['Category ID'],
          question_text: row.question_text || row['Question Text'] || row.question,
          question_type: (row.question_type || row['Question Type'] || 'single_choice') as 'single_choice' | 'multiple_choice' | 'text',
          media_type: (row.media_type || row['Media Type'] || 'none') as 'none' | 'image' | 'video',
          image_url: row.image_url || row['Image URL'] || undefined,
          video_url: row.video_url || row['Video URL'] || undefined,
          video_thumbnail_url: row.video_thumbnail_url || row['Video Thumbnail URL'] || undefined,
          explanation: row.explanation || row['Explanation'] || undefined,
          answers: this.parseAnswers(row),
          is_active: row.is_active !== undefined ? row.is_active : true,
        };

        // Validate question
        if (!questionDto.question_text) {
          errors.push(`Row ${i + 2}: Missing required field (question_text)`);
          continue;
        }

        // Handle category - can be ID or name
        let categoryId = questionDto.category_id;
        if (!categoryId) {
          const categoryName = row.category_name || row['Category Name'] || row.category;
          if (categoryName) {
            let category = await this.categoryModel.findOne({ name: categoryName }).exec();
            if (!category) {
              category = await this.categoryModel.create({ name: categoryName, is_active: true });
            }
            categoryId = category._id.toString();
          } else {
            errors.push(`Row ${i + 2}: Missing required field (category_id or category_name)`);
            continue;
          }
        }
        questionDto.category_id = categoryId;

        if (!questionDto.answers || questionDto.answers.length < 2) {
          errors.push(`Row ${i + 2}: At least 2 answers required`);
          continue;
        }

        if (!questionDto.answers.some((a) => a.is_correct)) {
          errors.push(`Row ${i + 2}: At least one correct answer required`);
          continue;
        }

        await this.questionModel.create(questionDto);
        imported++;
      } catch (error: any) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    return { imported, errors };
  }

  private parseAnswers(row: any): Array<{ answer_text: string; is_correct: boolean; sort_order: number }> {
    const answers: Array<{ answer_text: string; is_correct: boolean; sort_order: number }> = [];

    // Try different formats
    if (row.answers && typeof row.answers === 'string') {
      // JSON string format
      try {
        const parsed = JSON.parse(row.answers);
        return parsed.map((a: any, idx: number) => ({
          answer_text: a.answer_text || a.text || a.answer,
          is_correct: a.is_correct || a.correct || false,
          sort_order: idx,
        }));
      } catch {
        // Ignore parse error
      }
    }

    // Column format: answer1, answer2, answer3, answer4, correct_answer (number 1-4)
    const answerColumns = [];
    for (let i = 1; i <= 10; i++) {
      const answerText = row[`answer${i}`] || row[`Answer ${i}`] || row[`answer_${i}`] || row[`Відповідь ${i}`];
      if (answerText) {
        answerColumns.push({ text: answerText, index: i });
      }
    }

    const correctAnswer = row.correct_answer || row['Correct Answer'] || row.correct || row['Правильна відповідь'];
    const correctIndex = correctAnswer ? parseInt(correctAnswer.toString()) : null;

    answerColumns.forEach((col) => {
      answers.push({
        answer_text: col.text,
        is_correct: correctIndex !== null && col.index === correctIndex,
        sort_order: col.index - 1,
      });
    });

    return answers;
  }
}


