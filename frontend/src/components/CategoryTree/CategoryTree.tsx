import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category, CreateCategoryDto } from '../../services/categories.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CategoryTreeProps {
  categories: Category[];
  onUpdate: (id: string, data: Partial<CreateCategoryDto>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCreate: (data: CreateCategoryDto) => Promise<void>;
  isLoading?: boolean;
  categoryType: 'question' | 'knowledge-base';
}

interface SortableCategoryItemProps {
  category: Category;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  children?: Category[];
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function SortableCategoryItem({
  category,
  level,
  onEdit,
  onDelete,
  children,
  hasChildren,
  isExpanded,
  onToggleExpand,
}: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          pl: level * 3,
          py: 1,
          borderBottom: '1px solid #e0e0e0',
          '&:hover': { bgcolor: '#f5f5f5' },
        }}
      >
        <Box
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', mr: 1 }}
        >
          <DragIndicatorIcon fontSize="small" color="action" />
        </Box>
        {hasChildren && (
          <IconButton size="small" onClick={onToggleExpand} sx={{ mr: 0.5 }}>
            {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
        {!hasChildren && <Box sx={{ width: 32 }} />}
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          {category.name}
        </Typography>
        <Chip
          label={category.is_active ? 'Активна' : 'Неактивна'}
          size="small"
          color={category.is_active ? 'success' : 'default'}
          sx={{ mr: 1 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          Порядок: {category.sort_order || 0}
        </Typography>
        <IconButton size="small" color="primary" onClick={() => onEdit(category)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(category._id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
      {isExpanded && children && children.length > 0 && (
        <Box>
          {children.map((child) => (
            <SortableCategoryItem
              key={child._id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              hasChildren={false}
              isExpanded={false}
              onToggleExpand={() => {}}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

const CategoryTree = ({
  categories,
  onUpdate,
  onDelete,
  onCreate,
  isLoading,
  categoryType,
}: CategoryTreeProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    sort_order: 0,
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Побудова дерева категорій
  const categoryTree = useMemo(() => {
    const categoryMap = new Map<string, Category & { children: Category[] }>();
    const rootCategories: (Category & { children: Category[] })[] = [];

    // Створюємо мапу всіх категорій
    categories.forEach((cat) => {
      categoryMap.set(cat._id, { ...cat, children: [] });
    });

    // Побудова дерева
    categories.forEach((cat) => {
      const categoryNode = categoryMap.get(cat._id)!;
      const parentId =
        typeof cat.parent_id === 'object' ? cat.parent_id._id : cat.parent_id || null;

      if (parentId && categoryMap.has(parentId)) {
        categoryMap.get(parentId)!.children.push(categoryNode);
      } else {
        rootCategories.push(categoryNode);
      }
    });

    // Сортування за sort_order
    const sortCategories = (cats: (Category & { children: Category[] })[]) => {
      cats.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      cats.forEach((cat) => {
        if (cat.children.length > 0) {
          sortCategories(cat.children);
        }
      });
    };

    sortCategories(rootCategories);
    return rootCategories;
  }, [categories]);

  // Отримання плоского списку для drag & drop
  const flatCategories = useMemo(() => {
    const flatten = (cats: (Category & { children: Category[] })[], level = 0): Category[] => {
      const result: Category[] = [];
      cats.forEach((cat) => {
        result.push(cat);
        if (cat.children.length > 0 && expandedCategories.has(cat._id)) {
          result.push(...flatten(cat.children, level + 1));
        }
      });
      return result;
    };
    return flatten(categoryTree);
  }, [categoryTree, expandedCategories]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = flatCategories.findIndex((cat) => cat._id === active.id);
    const newIndex = flatCategories.findIndex((cat) => cat._id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const movedCategory = flatCategories[oldIndex];
    const targetCategory = flatCategories[newIndex];

    // Оновлюємо sort_order
    const newSortOrder = targetCategory.sort_order || newIndex;

    try {
      await onUpdate(movedCategory._id, { sort_order: newSortOrder });
    } catch (error) {
      console.error('Error updating category order:', error);
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        parent_id:
          typeof category.parent_id === 'object' ? category.parent_id._id : category.parent_id || undefined,
        sort_order: category.sort_order || 0,
        is_active: category.is_active !== undefined ? category.is_active : true,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        sort_order: 0,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      sort_order: 0,
      is_active: true,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await onUpdate(editingCategory._id, formData);
      } else {
        await onCreate(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const parentCategories = categories.filter(
    (cat) => !cat.parent_id || (typeof cat.parent_id === 'object' && !cat.parent_id._id),
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Дерево категорій</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Додати категорію
        </Button>
      </Box>

      <Paper>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : categoryTree.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary">Категорій не знайдено</Typography>
          </Box>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={flatCategories.map((cat) => cat._id)} strategy={verticalListSortingStrategy}>
              {categoryTree.map((category) => (
                <SortableCategoryItem
                  key={category._id}
                  category={category}
                  level={0}
                  onEdit={handleOpenDialog}
                  onDelete={onDelete}
                  children={category.children}
                  hasChildren={category.children.length > 0}
                  isExpanded={expandedCategories.has(category._id)}
                  onToggleExpand={() => toggleExpand(category._id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Редагувати категорію' : 'Створити категорію'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Назва"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Батьківська категорія (опційно)</InputLabel>
              <Select
                value={formData.parent_id || ''}
                label="Батьківська категорія (опційно)"
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || undefined })}
              >
                <MenuItem value="">Немає</MenuItem>
                {parentCategories
                  .filter((cat) => !editingCategory || cat._id !== editingCategory._id)
                  .map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label="Порядок сортування"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                label="Статус"
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              >
                <MenuItem value="active">Активна</MenuItem>
                <MenuItem value="inactive">Неактивна</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.name}>
            {editingCategory ? 'Зберегти' : 'Створити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryTree;

