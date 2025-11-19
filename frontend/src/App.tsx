import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import QuestionsPage from './pages/questions/QuestionsPage';
import QuestionFormPage from './pages/questions/QuestionFormPage';
import KnowledgeBasePage from './pages/knowledge-base/KnowledgeBasePage';
import KnowledgeBaseArticleFormPage from './pages/knowledge-base/KnowledgeBaseArticleFormPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import StatisticsPage from './pages/statistics/StatisticsPage';
import SurveysPage from './pages/surveys/SurveysPage';
import SurveyFormPage from './pages/surveys/SurveyFormPage';
import SurveyResponsesPage from './pages/surveys/SurveyResponsesPage';
import SettingsPage from './pages/settings/SettingsPage';
import AchievementsPage from './pages/achievements/AchievementsPage';
import AchievementFormPage from './pages/achievements/AchievementFormPage';
import ShopPage from './pages/shop/ShopPage';
import ShopProductFormPage from './pages/shop/ShopProductFormPage';
import ShopCategoriesPage from './pages/shop-categories/ShopCategoriesPage';
import QuestionCategoriesPage from './pages/question-categories/QuestionCategoriesPage';
import KnowledgeBaseCategoriesPage from './pages/knowledge-base-categories/KnowledgeBaseCategoriesPage';
import FeedbackPage from './pages/feedback/FeedbackPage';
import LogsPage from './pages/logs/LogsPage';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Показуємо завантаження, поки перевіряється аутентифікація
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Завантаження...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="questions/new" element={<QuestionFormPage />} />
        <Route path="questions/:id/edit" element={<QuestionFormPage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="knowledge-base/articles/new" element={<KnowledgeBaseArticleFormPage />} />
        <Route path="knowledge-base/articles/:id/edit" element={<KnowledgeBaseArticleFormPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id/details" element={<UserDetailsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="surveys" element={<SurveysPage />} />
        <Route path="surveys/new" element={<SurveyFormPage />} />
        <Route path="surveys/:id/edit" element={<SurveyFormPage />} />
        <Route path="surveys/:id/responses" element={<SurveyResponsesPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="achievements/new" element={<AchievementFormPage />} />
        <Route path="achievements/:id/edit" element={<AchievementFormPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="shop/products/new" element={<ShopProductFormPage />} />
        <Route path="shop/products/:id/edit" element={<ShopProductFormPage />} />
        <Route path="shop/categories" element={<ShopCategoriesPage />} />
        <Route path="question-categories" element={<QuestionCategoriesPage />} />
        <Route path="knowledge-base/categories" element={<KnowledgeBaseCategoriesPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

