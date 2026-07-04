import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoldersMeta, loadWords } from '../../data/loaders';
import type { FolderMeta } from '../../data/types';
import { canTakeExam, getFolderStatus, getReadiness } from '../../engine/progress';
import { useProgressStore } from '../../store/progressStore';
import { useT } from '../../i18n/useT';
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
    <div className="screen">
      <div className="flagStripe" />
      <h1 className="screenTitle">{t('folders.title')}</h1>
      <div className={styles.list}>
        {folders.map((folder) => {
          if (folder.isAlphabet) return null;
          const status = getFolderStatus(folder, progress);
          const readiness = readinessMap[folder.id] ?? 0;
          const passed = progress.passedExams.includes(folder.id);
          const showExam = canTakeExam(readiness, passed);

          return (
            <Card
              key={folder.id}
              disabled={status === 'locked'}
              onClick={() => {
                if (status === 'opened' || status === 'passed') navigate('/modes');
              }}
              className={styles.folderCard}
            >
              <div className={styles.row}>
                <div>
                  <h3 className={styles.name}>{getName(folder)}</h3>
                  {status === 'locked' && (
                    <span className={styles.muted}>🔒 {t('folders.locked')}</span>
                  )}
                  {passed && <span className={styles.passed}>✓ {t('folders.passed')}</span>}
                </div>
                {showExam && (
                  <button
                    type="button"
                    className={styles.examBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/exam/${folder.id}`);
                    }}
                    aria-label={t('folders.examReady')}
                  >
                    📝
                  </button>
                )}
              </div>

              {(status === 'opened' || status === 'passed') && (
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
