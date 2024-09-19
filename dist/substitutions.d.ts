import { CheerioAPI } from "cheerio";
import { LessonSubstitute, SubstitutionTable } from "./types";
export default class SubstitutionsPage {
    $: CheerioAPI;
    private shortDayNames;
    constructor(html: string);
    parseLessonNumber(lesson: string): {
        number: number;
        timeRange: string;
    };
    parseSubstituts(entry: string): LessonSubstitute | null;
    parseSubstitutionSite(): {
        heading: string;
        timeRange: string;
        tables: SubstitutionTable[];
    };
}
