import { CheerioAPI } from "cheerio";
import { SubstitutionsPage } from "./types";
export default class Substitutions {
    $: CheerioAPI;
    private shortDayNames;
    constructor(html: string);
    private parseLessonNumber;
    private parseSubstituts;
    parseSubstitutionSite(): SubstitutionsPage;
}
