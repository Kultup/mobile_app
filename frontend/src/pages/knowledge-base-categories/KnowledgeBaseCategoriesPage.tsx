import { useState } from 'react';
import { Typography, Box, Tabs, Tab } from '@mui/material';
import KnowledgeBaseCategoriesManager from '../../components/KnowledgeBaseCategoriesManager/KnowledgeBaseCategoriesManager';
import CategoryTree from '../../components/CategoryTree/CategoryTree';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService, CreateCategoryDto } from '../../services/categories.service';

const KnowledgeBaseCategoriesPage = () => {
  const [tab, setTab] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge-base-categories', 'all'],
    queryFn: () => categoriesService.getKnowledgeBaseCategories(true),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryDto> }) =>
      categoriesService.updateKnowledgeBaseCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.deleteKnowledgeBaseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-categories'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesService.createKnowledgeBaseCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-categories'] });
    },
  });

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Категорії бази знань
      </Typography>

      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Таблиця" />
        <Tab label="Дерево" />
      </Tabs>

      {tab === 0 && <KnowledgeBaseCategoriesManager />}
      {tab === 1 && (
        <CategoryTree
          categories={data?.data || []}
          onUpdate={async (id, data) => {
            await updateMutation.mutateAsync({ id, data });
          }}
          onDelete={async (id) => {
            if (window.confirm('Ви впевнені, що хочете видалити цю категорію?')) {
              await deleteMutation.mutateAsync(id);
            }
          }}
          onCreate={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          isLoading={isLoading}
          categoryType="knowledge-base"
        />
      )}
    </Box>
  );
};

export default KnowledgeBaseCategoriesPage;
