"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = require("cheerio");
class SubstitutionsPage {
    constructor(html) {
        this.shortDayNames = ["pon", "wt", "śr", "czw", "pt", "sob", "nie"];
        this.$ = (0, cheerio_1.load)(html);
    }
    parseLessonNumber(lesson) {
        const [number, timeRange] = lesson.split(",");
        return {
            number: parseInt(number),
            timeRange: timeRange.trim(),
        };
    }
    parseSubstituts(entry) {
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
    parseSubstitutionSite() {
        const timeRange = this.$("h2").text().trim();
        const heading = this.$("h1").text().trim();
        const tables = [];
        this.$("table").each((_index, table) => {
            var _a, _b;
            const rows = this.$(table).find("tr");
            const tableDate = rows.first().text().trim();
            const substitutions = [];
            rows.slice(1).each((_i, row) => {
                const columns = this.$(row).find("td");
                const [lesson, teacher, classValue, subject, room, caseValue, message] = columns.map((_index, column) => this.$(column).text().trim()).get();
                const lessonSubstitute = (message === null || message === void 0 ? void 0 : message.length) > 0
                    ? message
                        .split("\n")
                        .map(this.parseSubstituts)
                        .filter((entry) => entry !== null)
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
                ? this.shortDayNames.indexOf((_b = (_a = match[0]) === null || _a === void 0 ? void 0 : _a.substring(1)) === null || _b === void 0 ? void 0 : _b.replace(".)", ""))
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
exports.default = SubstitutionsPage;
