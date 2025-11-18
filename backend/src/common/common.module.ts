import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesController } from './controllers/cities.controller';
import { PositionsController } from './controllers/positions.controller';
import { City, CitySchema } from './schemas/city.schema';
import { Position, PositionSchema } from './schemas/position.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: City.name, schema: CitySchema },
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  controllers: [CitiesController, PositionsController],
  exports: [MongooseModule],
})
export class CommonModule {}

