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
    const parts = entry.trim().split(/\s+/);

    let subjectWords: string[] = [];
    let teacher: string | null = null;
    let room: string | null = null;
    let groupName: string | undefined;
    let match: RegExpMatchArray | null;

    const teacherRegex = /^\p{Lu}\p{L}$/u;
    const roomRegex = /^(?:3[0-7]|[3-9]|[12][0-9]|W.*|G.*|WG.*)$/;
    const groupNameRegex = /^-([\d/]+|[A-Z])$|^(\d+[A-Za-z]+)$/;

    for (const word of parts) {
      if (!teacher && teacherRegex.test(word)) {
        teacher = word;
      } else if (!room && roomRegex.test(word)) {
        room = word;
      } else if (!groupName && (match = word.match(groupNameRegex))) {
        groupName = match[1] || match[2];
      } else {
        subjectWords.push(word);
      }
    }

    let subject = subjectWords.join(" ");

    const subjectRegex = /^(.+?)(?:-([\d/]+|[A-Z]))?$/;
    match = subject.match(subjectRegex);
    if (match) {
      subject = match[1].trim();
      if (!groupName && match[2]) {
        groupName = match[2];
      }
    }

    if (!subject || !room) {
      return null;
    }

    return {
      subject,
      ...(teacher ? { teacher } : {}),
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
