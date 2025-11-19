import { Box, Paper, Typography, Tooltip } from '@mui/material';

interface ActivityHeatmapProps {
  data: Array<{ date: string; count: number }>;
}

const ActivityHeatmap = ({ data }: ActivityHeatmapProps) => {
  // Групуємо дані за тижнями
  const weeks: Array<Array<{ date: string; count: number }>> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Останні 52 тижні (рік)
  for (let week = 51; week >= 0; week--) {
    const weekData: Array<{ date: string; count: number }> = [];
    for (let day = 6; day >= 0; day--) {
      const date = new Date(today);
      date.setDate(date.getDate() - week * 7 - day);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = data.find((d) => d.date === dateStr);
      weekData.push(dayData || { date: dateStr, count: 0 });
    }
    weeks.push(weekData);
  }

  // Знаходимо максимальне значення для нормалізації
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return '#ebedf0';
    const intensity = count / maxCount;
    if (intensity < 0.25) return '#c6e48b';
    if (intensity < 0.5) return '#7bc96f';
    if (intensity < 0.75) return '#239a3b';
    return '#196127';
  };

  const getTooltipText = (day: { date: string; count: number }) => {
    const date = new Date(day.date);
    return `${date.toLocaleDateString('uk-UA')}: ${day.count} активностей`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Теплова карта активності (останній рік)
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Box display="flex" gap={0.5}>
          {weeks.map((week, weekIndex) => (
            <Box key={weekIndex} display="flex" flexDirection="column" gap={0.5}>
              {week.map((day, dayIndex) => (
                <Tooltip key={dayIndex} title={getTooltipText(day)} arrow>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: getColor(day.count),
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '1px solid rgba(27, 31, 35, 0.06)',
                      '&:hover': {
                        border: '1px solid rgba(27, 31, 35, 0.3)',
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="caption" color="text.secondary">
          Менше
        </Typography>
        <Box display="flex" gap={0.5} alignItems="center">
          <Box sx={{ width: 12, height: 12, bgcolor: '#ebedf0', borderRadius: 2, border: '1px solid rgba(27, 31, 35, 0.06)' }} />
          <Box sx={{ width: 12, height: 12, bgcolor: '#c6e48b', borderRadius: 2, border: '1px solid rgba(27, 31, 35, 0.06)' }} />
          <Box sx={{ width: 12, height: 12, bgcolor: '#7bc96f', borderRadius: 2, border: '1px solid rgba(27, 31, 35, 0.06)' }} />
          <Box sx={{ width: 12, height: 12, bgcolor: '#239a3b', borderRadius: 2, border: '1px solid rgba(27, 31, 35, 0.06)' }} />
          <Box sx={{ width: 12, height: 12, bgcolor: '#196127', borderRadius: 2, border: '1px solid rgba(27, 31, 35, 0.06)' }} />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Більше
        </Typography>
      </Box>
    </Paper>
  );
};

export default ActivityHeatmap;

