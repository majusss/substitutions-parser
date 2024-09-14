export interface Substitution {
    lesson: string;
    teacher: string;
    branch: string;
    subject: string;
    class: string;
    case: string;
    message: string;
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
