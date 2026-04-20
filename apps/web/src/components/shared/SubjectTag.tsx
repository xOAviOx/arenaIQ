import { Subject } from '@arenaiq/types';
import { cn } from '@/lib/utils';

const SUBJECT_STYLES: Record<Subject, string> = {
  [Subject.PHYSICS]: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  [Subject.CHEMISTRY]: 'bg-green-500/10 text-green-400 border-green-500/30',
  [Subject.MATHEMATICS]: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  [Subject.BIOLOGY]: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

interface SubjectTagProps {
  subject: Subject;
  className?: string;
}

export function SubjectTag({ subject, className }: SubjectTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
        SUBJECT_STYLES[subject],
        className,
      )}
    >
      {subject}
    </span>
  );
}
