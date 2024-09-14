import { CheerioAPI, load } from "cheerio";
import { Substitution, SubstitutionTable } from "./types";

export default class SubstitutionsPage {
  public $: CheerioAPI;

  private shortDayNames = ["pon", "wt", "śr", "czw", "pt", "sob", "nie"];

  public constructor(html: string) {
    this.$ = load(html);
  }

  public parseSubstitutionSite() {
    const timeRange = this.$("h2").text().trim();
    const heading = this.$("h1").text().trim();
    const tables: SubstitutionTable[] = [];

    this.$("table").each((_index, table) => {
      const rows = this.$(table).find("tr");
      const tableDate = rows.first().text().trim();
      const substitutions: Substitution[] = [];

      rows.slice(1).each((_i, row) => {
        const columns = this.$(row).find("td");
        const [
          lesson,
          teacher,
          branch,
          subject,
          classValue,
          caseValue,
          message,
        ] = columns.map((_index, column) => this.$(column).text().trim()).get();

        if (lesson) {
          substitutions.push({
            lesson,
            teacher,
            branch,
            subject,
            class: classValue,
            case: caseValue,
            message,
          });
        }
      });

      const match = tableDate.match(/\([^)]*\)/i);
      const weekday = match
        ? this.shortDayNames.indexOf(match[0]?.substring(1)?.replace(".)", ""))
        : -1;

      tables.push({
        time: tableDate,
        weekday,
        substitutions,
      });
    });

    return {
      heading,
      timeRange,
      tables,
    };
  }
}
