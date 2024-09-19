export interface LessonSubstitute {
  subject: string;
  room: string;
  groupName?: string;
  teacher: string;
}

export interface Substitution {
  number: number;
  timeRange: string;
  teacher: string;
  class: string;
  subject: string;
  room: string;
  case: string;
  lessonSubstitute?: LessonSubstitute[];
}

export interface SubstitutionTable {
  time: string;
  weekday: number;
  substitutions: Substitution[];
}

export interface SubstitutionsPage {
  heading: string;
  timeRange: string;
  tables: SubstitutionTable[];
}
