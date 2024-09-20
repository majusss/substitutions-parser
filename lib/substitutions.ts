import { CheerioAPI, load } from "cheerio";
import {
  LessonSubstitute,
  Substitution,
  SubstitutionsPage,
  SubstitutionTable,
} from "./types";

export default class Substitutions {
  public $: CheerioAPI;

  private shortDayNames = ["pon", "wt", "śr", "czw", "pt", "sob", "nie"];

  public constructor(html: string) {
    this.$ = load(html);
  }

  private parseLessonNumber(lesson: string): {
    number: number;
    timeRange: string;
  } {
    const [number, timeRange] = lesson.split(",");
    return {
      number: parseInt(number),
      timeRange: timeRange.trim(),
    };
  }

  private parseSubstituts(entry: string): LessonSubstitute | null {
    const tokens = entry.trim().split(/\s+/);

    if (tokens.length < 3) {
      return null;
    }

    const rawSubject = tokens[0];
    const teacher = tokens[1];
    const room = tokens[2];

    const subjectRegex = /^(.+?)(?:-([\d/]+|[A-Z]))?$/;
    const match = rawSubject.match(subjectRegex);

    if (!match) {
      return null;
    }

    const subject = match[1];
    const groupName = match[2];

    return {
      subject,
      teacher,
      room,
      ...(groupName ? { groupName } : {}),
    };
  }

  public parseSubstitutionSite(): SubstitutionsPage {
    const timeRange = this.$("h2").text().trim();
    const heading = this.$("h1").text().trim();
    const tables: SubstitutionTable[] = [];

    this.$("table").each((_index, table) => {
      const rows = this.$(table).find("tr");
      const tableDate = rows.first().text().trim();
      const substitutions: Substitution[] = [];

      rows.slice(1).each((_i, row) => {
        const columns = this.$(row).find("td");
        const [lesson, teacher, classValue, subject, room, caseValue, message] =
          columns.map((_index, column) => this.$(column).text().trim()).get();

        const lessonSubstitute =
          message?.length > 0
            ? message
                .split("\n")
                .map(this.parseSubstituts)
                .filter((entry): entry is LessonSubstitute => entry !== null)
            : [];

        if (lesson) {
          substitutions.push({
            ...this.parseLessonNumber(lesson),
            teacher,
            subject,
            class: classValue,
            room,
            case: caseValue,
            ...(lessonSubstitute.length > 0 ? { lessonSubstitute } : {}),
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
