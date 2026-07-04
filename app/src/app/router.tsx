import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';
import { ModesPage } from '../features/modes/ModesPage';
import { FoldersPage } from '../features/folders/FoldersPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { StudyPage } from '../features/study/StudyPage';
import { ExamPage } from '../features/exam/ExamPage';
import { AlphabetPage } from '../features/alphabet/AlphabetPage';
import { AboutPage } from '../features/settings/AboutPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/modes" replace /> },
      { path: '/modes', element: <ModesPage /> },
      { path: '/folders', element: <FoldersPage /> },
      { path: '/progress', element: <ProgressPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/settings/about', element: <AboutPage /> },
      { path: '/study/:modeId/:folderId', element: <StudyPage /> },
      { path: '/exam/:folderId', element: <ExamPage /> },
      { path: '/alphabet/:submode', element: <AlphabetPage /> },
    ],
  },
]);
