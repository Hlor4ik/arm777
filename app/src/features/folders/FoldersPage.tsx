import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoldersMeta, loadWords } from '../../data/loaders';
import type { FolderMeta } from '../../data/types';
import { getFolderStatus, getReadiness } from '../../engine/progress';
import { ALL_STUDY_FOLDER_IDS } from '../../data/folders';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
import { UI_ASSETS } from '../../assets/ui';
import { Button } from '../../components/Button/Button';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { Card } from '../../components/Card/Card';
import styles from './FoldersPage.module.css';

export function FoldersPage() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const progress = useProgressStore();
  const [folders, setFolders] = useState<FolderMeta[]>([]);
  const [readinessMap, setReadinessMap] = useState<Record<string, number>>({});

  useEffect(() => {
    getFoldersMeta().then(async (meta) => {
      const sorted = [...meta].sort((a, b) => a.order - b.order);
      setFolders(sorted);
      const ready: Record<string, number> = {};
      for (const f of sorted) {
        if (f.isAlphabet) continue;
        const words = await loadWords(f.id);
        ready[f.id] = getReadiness(f.id, words, progress.wordProgress);
      }
      setReadinessMap(ready);
    });
  }, [progress.wordProgress, progress.openedFolders, progress.passedExams]);

  const getName = (f: FolderMeta) => (lang === 'ru' ? f.nameRu : f.nameEn);

  return (
    <div className={styles.page} style={{ ['--folders-mock' as string]: `url(${UI_ASSETS.mockFolders})` }}>
      <div className="ornamentDivider" />
      <h1 className={`screenTitle ${styles.title}`}>{t('folders.title')}</h1>
      <p className="screenSubtitle">{lang === 'ru' ? 'Ваш путь к fluency' : 'Your path to fluency'}</p>
      <div className={styles.list}>
        {folders.map((folder, index) => {
          if (folder.isAlphabet) return null;
          const status = getFolderStatus(folder, progress);
          const isOpen =
            status === 'opened' ||
            status === 'passed' ||
            ALL_STUDY_FOLDER_IDS.includes(folder.id as (typeof ALL_STUDY_FOLDER_IDS)[number]);
          const readiness = readinessMap[folder.id] ?? 0;
          const passed = progress.passedExams.includes(folder.id);
          const showExam = !passed && readiness >= 70 && isOpen;
          const locked = !isOpen && status !== 'available';

          return (
            <Card
              key={folder.id}
              onClick={() => {
                if (isOpen) navigate('/modes');
              }}
              className={`${styles.folderCard} ${isOpen ? styles.open : ''} ${passed ? styles.passedCard : ''}`}
            >
              <div className={styles.row}>
                <div className={styles.left}>
                  <span
                    className={`${styles.thumb} ${locked ? styles.thumbLocked : ''}`}
                    style={
                      locked
                        ? undefined
                        : {
                            backgroundImage: `url(${UI_ASSETS.mockFolders})`,
                            backgroundSize: '100% 400%',
                            backgroundPosition: `center ${index * 25}%`,
                          }
                    }
                  >
                    {locked ? '🔒' : ''}
                  </span>
                  <div>
                    <h3 className={styles.name}>{getName(folder)}</h3>
                    {passed && (
                  <span className={styles.passedBadge}>{lang === 'ru' ? 'Сдано' : 'Passed'}</span>
                )}
                  </div>
                </div>
                {showExam && (
                  <button
                    type="button"
                    className={styles.examBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/exam/${folder.id}`);
                    }}
                  >
                    {lang === 'ru' ? 'Экзамен' : 'Exam'}
                  </button>
                )}
              </div>

              {isOpen && (
                <div className={styles.progressWrap}>
                  <ProgressBar value={readiness} />
                  <span className={styles.pct}>{readiness}%</span>
                </div>
              )}

              {status === 'available' && (
                <Button
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    progress.openFolder(folder.id);
                  }}
                >
                  {t('folders.openAccess')}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
