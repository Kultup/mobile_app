import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  icon_url: string;

  @IsEnum(['testing', 'activity', 'accuracy', 'rating', 'special'])
  @IsNotEmpty()
  category: string;

  @IsEnum([
    'tests_count',
    'streak',
    'perfect_tests',
    'rating_position',
    'total_points',
    'correct_answers_count',
    'average_score',
    'consecutive_perfect_tests',
    'longest_streak',
    'shop_purchases_count',
    'total_correct_answers',
    'accuracy_percentage',
  ])
  @IsNotEmpty()
  condition_type: string;

  @IsNumber()
  @IsNotEmpty()
  condition_value: number;

  @IsOptional()
  condition_extra?: any; // Додаткові параметри (наприклад, { category_id: '...' })

  @IsNumber()
  @IsOptional()
  reward_points?: number = 0;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @IsNumber()
  @IsOptional()
  sort_order?: number = 0;
}

