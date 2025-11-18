import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
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
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, User } from '../../services/admin.service';
import { citiesService } from '../../services/cities.service';
import { positionsService } from '../../services/positions.service';
import { useQuery } from '@tanstack/react-query';

const schema = yup.object({
  full_name: yup.string().required('ПІБ обов\'язкове'),
  city_id: yup.string().required('Місто обов\'язкове'),
  position_id: yup.string().required('Посада обов\'язкова'),
  is_active: yup.boolean().optional(),
});

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const UserEditDialog: React.FC<UserEditDialogProps> = ({ open, onClose, user }) => {
  const queryClient = useQueryClient();

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: citiesService.getAll,
  });

  const { data: positionsData } = useQuery({
    queryKey: ['positions'],
    queryFn: positionsService.getAll,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Partial<User>>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      full_name: '',
      city_id: '',
      position_id: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        city_id: typeof user.city_id === 'object' ? user.city_id._id : user.city_id || '',
        position_id: typeof user.position_id === 'object' ? user.position_id._id : user.position_id || '',
        is_active: user.is_active,
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<User>) => adminService.updateUser(user!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const onSubmit = (data: Partial<User>) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Редагувати користувача</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ПІБ"
                    fullWidth
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message as string}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="city_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.city_id}>
                    <InputLabel>Місто</InputLabel>
                    <Select {...field} label="Місто">
                      {citiesData?.data.map((city) => (
                        <MenuItem key={city._id} value={city._id}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.city_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                        {errors.city_id.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="position_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.position_id}>
                    <InputLabel>Посада</InputLabel>
                    <Select {...field} label="Посада">
                      {positionsData?.data.map((position) => (
                        <MenuItem key={position._id} value={position._id}>
                          {position.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.position_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                        {errors.position_id.message as string}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Активний"
                  />
                )}
              />
            </Grid>

            {updateMutation.isError && (
              <Grid item xs={12}>
                <Alert severity="error">Помилка оновлення користувача</Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Скасувати</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <CircularProgress size={20} /> : 'Зберегти'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserEditDialog;

