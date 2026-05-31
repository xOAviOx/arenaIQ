import { Subject } from '@arenaiq/types';
import { cn } from '@/lib/utils';

const SUBJECT_STYLES: Record<Subject, string> = {
  [Subject.PHYSICS]: 'bg-arena-blue/10 text-arena-blue border-arena-blue/30',
  [Subject.CHEMISTRY]: 'bg-arena-green/10 text-arena-green border-arena-green/30',
  [Subject.MATHEMATICS]: 'bg-arena-cyan/10 text-arena-cyan border-arena-cyan/30',
  [Subject.BIOLOGY]: 'bg-arena-gold/10 text-arena-gold border-arena-gold/30',
};

interface SubjectTagProps {
  subject: Subject;
  className?: string;
}

export function SubjectTag({ subject, className }: SubjectTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider',
        SUBJECT_STYLES[subject],
        className,
      )}
    >
      {subject}
    </span>
  );
}
