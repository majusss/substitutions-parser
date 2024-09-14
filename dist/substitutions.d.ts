import { CheerioAPI } from "cheerio";
import { SubstitutionTable } from "./types";
export default class SubstitutionsPage {
    $: CheerioAPI;
    private shortDayNames;
    constructor(html: string);
    parseSubstitutionSite(): {
        heading: string;
        timeRange: string;
        tables: SubstitutionTable[];
    };
}
